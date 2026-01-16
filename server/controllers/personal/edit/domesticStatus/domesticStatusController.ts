import PersonalEditController from '../personalEditController'
import PersonalPageService from '../../../../services/personalPageService'
import { AuditService } from '../../../../services/auditService'
import { domesticStatusFieldData } from '../../fieldData'
import getCommonRequestData from '../../../../utils/getCommonRequestData'
import { requestBodyFromFlash } from '../../../../utils/requestBodyFromFlash'
import { apostrophe, objectToRadioOptions } from '../../../../utils/utils'
import { PrisonUser } from '../../../../interfaces/HmppsUser'
import { EditControllerRequestHandlers } from '../../../interfaces/EditControllerRequestHandlers'

export default class DomesticStatusController extends PersonalEditController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    protected readonly auditService: AuditService,
  ) {
    super(auditService)
  }

  domesticStatus(): EditControllerRequestHandlers {
    const { fieldName } = domesticStatusFieldData

    return {
      edit: async (req, res, next) => {
        const { prisonerNumber } = req.params
        const { clientToken, naturalPrisonerName } = getCommonRequestData(req, res)
        const requestBodyFlash = requestBodyFromFlash<{ radioField: string }>(req)
        const domesticStatusReferenceData = await this.personalPageService.getDomesticStatusReferenceData(clientToken)

        const options = domesticStatusReferenceData.filter(it => it.code !== 'N')
        const preferNotToSayOption = domesticStatusReferenceData.find(it => it.code === 'N')

        const fieldValue =
          requestBodyFlash?.radioField ||
          (await this.personalPageService.getDomesticStatus(clientToken, prisonerNumber))?.domesticStatusCode

        const radioOptions = [
          ...objectToRadioOptions(options, 'code', 'description', fieldValue),
          { divider: 'Or' },
          ...objectToRadioOptions(
            [{ ...preferNotToSayOption, description: 'They prefer not to say' }],
            'code',
            'description',
            fieldValue,
          ),
        ]

        return this.editRadioFields(
          `What is ${apostrophe(naturalPrisonerName)} marital or civil partnership status?`,
          domesticStatusFieldData,
          radioOptions,
        )(req, res, next)
      },

      submit: async (req, res) => {
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const radioField = req.body.radioField || null
        const previousValue = (await this.personalPageService.getDomesticStatus(clientToken, prisonerNumber))
          ?.domesticStatusCode

        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updateDomesticStatus(clientToken, user, prisonerNumber, radioField)
          },
          fieldData: domesticStatusFieldData,
          auditDetails: { fieldName, previous: previousValue, updated: radioField },
        })
      },
    }
  }
}
