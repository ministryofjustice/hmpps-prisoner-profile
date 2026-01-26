import PersonalPageService from '../../../../services/personalPageService'
import PersonalEditController from '../personalEditController'
import { AuditService } from '../../../../services/auditService'
import { shoeSizeFieldData } from '../../fieldData'
import { PrisonUser } from '../../../../interfaces/HmppsUser'
import { EditControllerRequestHandlers } from '../../../interfaces/EditControllerRequestHandlers'
import getCommonRequestData from '../../../../utils/getCommonRequestData'
import { mensShoeSizes, womensShoeSizes } from './shoeSizeUtils'
import { objectToSelectOptions } from '../../../../utils/utils'
import { requestBodyFromFlash } from '../../../../utils/requestBodyFromFlash'

export default class ShoeSizeController extends PersonalEditController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    protected readonly auditService: AuditService,
  ) {
    super(auditService)
  }

  shoeSize(): EditControllerRequestHandlers {
    const { pageTitle, formTitle, hintText, redirectAnchor, fieldName, auditEditPageLoad } = shoeSizeFieldData

    return {
      edit: async (req, res) => {
        const { prisonerNumber, prisonId, miniBannerData, clientToken } = getCommonRequestData(req, res)
        const { gender } = req.middleware.prisonerData

        const errors = req.flash('errors')
        const { autocompleteField: shoeSizeFromFlash, autocompleteError } =
          requestBodyFromFlash<{ autocompleteField: string; autocompleteError: string }>(req) || {}

        const existingShoeSize =
          shoeSizeFromFlash ??
          (await this.personalPageService.getPhysicalAttributes(clientToken, prisonerNumber)).shoeSize

        await this.auditService.sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: auditEditPageLoad,
        })

        res.render('pages/edit/shoeSize', {
          pageTitle: `${pageTitle} - Prisoner personal details`,
          formTitle,
          errors,
          hintText,
          autocompleteOptions: objectToSelectOptions(
            gender === 'Male' ? mensShoeSizes : womensShoeSizes,
            'value',
            'text',
            existingShoeSize,
          ),
          autocompleteError,
          redirectAnchor,
          miniBannerData,
        })
      },

      submit: async (req, res) => {
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const { autocompleteField: shoeSize } = req.body
        const physicalAttributes = await this.personalPageService.getPhysicalAttributes(clientToken, prisonerNumber)
        const previousShoeSize = physicalAttributes.shoeSize

        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
              shoeSize: shoeSize || null,
            })
          },
          fieldData: shoeSizeFieldData,
          auditDetails: [{ fieldName, previous: previousShoeSize, updated: shoeSize }],
        })
      },
    }
  }
}
