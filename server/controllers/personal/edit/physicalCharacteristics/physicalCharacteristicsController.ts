import { RadioFieldData } from '../../fieldData'
import { PrisonUser } from '../../../../interfaces/HmppsUser'
import PersonalEditController from '../personalEditController'
import PersonalPageService from '../../../../services/personalPageService'
import { AuditService } from '../../../../services/auditService'
import { EditControllerRequestHandlers } from '../../../interfaces/EditControllerRequestHandlers'
import { requestBodyFromFlash } from '../../../../utils/requestBodyFromFlash'
import { objectToRadioOptions } from '../../../../utils/utils'
import { CorePersonPhysicalAttributesRequest } from '../../../../data/interfaces/personIntegrationApi/personIntegrationApiClient'

export default class PhysicalCharacteristicsController extends PersonalEditController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    protected readonly auditService: AuditService,
  ) {
    super(auditService)
  }

  /**
   * Handler for editing single-value radio fields.
   *
   * @param fieldData - config for which physical characteristic to edit
   *
   * Handles editing:
   *   Hair type or colour
   *   Facial hair
   *   Face shape
   *   Build
   */
  physicalCharacteristicRadioField(fieldData: RadioFieldData): EditControllerRequestHandlers {
    const { pageTitle, code, domain, fieldName } = fieldData
    return {
      edit: async (req, res, next) => {
        const { clientToken } = req.middleware
        const { prisonerNumber } = req.params
        const requestBodyFlash = requestBodyFromFlash<{ radioField: string }>(req)

        const [characteristics, physicalAttributes] = await Promise.all([
          this.personalPageService.getReferenceDataCodes(clientToken, domain),
          this.personalPageService.getPhysicalAttributes(clientToken, prisonerNumber),
        ])
        const fieldValue = requestBodyFlash?.radioField || physicalAttributes[code]
        const options = objectToRadioOptions(characteristics, 'code', 'description', fieldValue)

        return this.editRadioFields(pageTitle, fieldData, options)(req, res, next)
      },

      submit: async (req, res) => {
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const radioField = req.body.radioField || null
        const physicalAttributes = await this.personalPageService.getPhysicalAttributes(clientToken, prisonerNumber)
        const previousValue = physicalAttributes?.[code as keyof CorePersonPhysicalAttributesRequest]
        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
              [code]: radioField,
            })
          },
          fieldData,
          auditDetails: { fieldName, previous: previousValue, updated: radioField },
        })
      },
    }
  }
}
