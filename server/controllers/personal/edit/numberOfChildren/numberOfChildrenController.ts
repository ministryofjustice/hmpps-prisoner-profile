import PersonalEditController from '../personalEditController'
import PersonalPageService from '../../../../services/personalPageService'
import { AuditService } from '../../../../services/auditService'
import { numberOfChildrenFieldData } from '../../fieldData'
import getCommonRequestData from '../../../../utils/getCommonRequestData'
import { requestBodyFromFlash } from '../../../../utils/requestBodyFromFlash'
import { PrisonUser } from '../../../../interfaces/HmppsUser'
import { EditControllerRequestHandlers } from '../../../interfaces/EditControllerRequestHandlers'

export default class NumberOfChildrenController extends PersonalEditController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    protected readonly auditService: AuditService,
  ) {
    super(auditService)
  }

  numberOfChildren(): EditControllerRequestHandlers {
    const { pageTitle, fieldName, auditEditPageLoad, redirectAnchor } = numberOfChildrenFieldData

    return {
      edit: async (req, res) => {
        const { clientToken, prisonerNumber, prisonId, naturalPrisonerName, miniBannerData } = getCommonRequestData(
          req,
          res,
        )
        const requestBodyFlash = requestBodyFromFlash<{ hasChildren: string; numberOfChildren?: number }>(req)
        const errors = req.flash('errors')

        const currentNumberOfChildren =
          requestBodyFlash?.numberOfChildren ??
          (await this.personalPageService.getNumberOfChildren(clientToken, prisonerNumber))?.numberOfChildren
        const radioFieldValue =
          (requestBodyFlash?.hasChildren ?? (currentNumberOfChildren && currentNumberOfChildren !== '0')) ? 'YES' : 'NO'

        await this.auditService.sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: auditEditPageLoad,
        })

        res.render('pages/edit/children', {
          pageTitle: `${pageTitle} - Prisoner personal details`,
          formTitle: `Does ${naturalPrisonerName} have any children?`,
          radioFieldValue,
          currentNumberOfChildren,
          errors,
          redirectAnchor,
          miniBannerData,
        })
      },

      submit: async (req, res) => {
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const { hasChildren, numberOfChildren } = req.body
        const previousValue = (await this.personalPageService.getNumberOfChildren(clientToken, prisonerNumber))
          ?.numberOfChildren

        const parsedNumberOfChildren = hasChildren === 'YES' ? Number(numberOfChildren) : 0

        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updateNumberOfChildren(
              clientToken,
              user,
              prisonerNumber,
              parsedNumberOfChildren,
            )
          },
          fieldData: numberOfChildrenFieldData,
          auditDetails: { fieldName, previous: previousValue, updated: numberOfChildren },
        })
      },
    }
  }
}
