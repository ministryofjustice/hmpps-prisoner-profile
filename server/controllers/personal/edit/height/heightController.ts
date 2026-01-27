import PersonalEditController from '../personalEditController'
import PersonalPageService from '../../../../services/personalPageService'
import { AuditService } from '../../../../services/auditService'
import { heightFieldData, heightImperialFieldData } from '../../fieldData'
import getCommonRequestData from '../../../../utils/getCommonRequestData'
import { requestBodyFromFlash } from '../../../../utils/requestBodyFromFlash'
import { PrisonUser } from '../../../../interfaces/HmppsUser'
import { centimetresToFeetAndInches, feetAndInchesToCentimetres } from '../../../../utils/unitConversions'
import { EditControllerRequestHandlers } from '../../../interfaces/EditControllerRequestHandlers'

export default class HeightController extends PersonalEditController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    protected readonly auditService: AuditService,
  ) {
    super(auditService)
  }

  height(): Record<'metric' | 'imperial', EditControllerRequestHandlers> {
    const { pageTitle, fieldName, auditEditPageLoad } = heightFieldData

    return {
      metric: {
        edit: async (req, res) => {
          const { clientToken, prisonerNumber, prisonId, miniBannerData } = getCommonRequestData(req, res)
          const requestBodyFlash = requestBodyFromFlash<{ editField: string }>(req)
          const errors = req.flash('errors')

          const { height } = await this.personalPageService.getPhysicalAttributes(clientToken, prisonerNumber)

          await this.auditService.sendPageView({
            user: res.locals.user,
            prisonerNumber,
            prisonId,
            correlationId: req.id,
            page: auditEditPageLoad,
          })

          res.render('pages/edit/heightMetric', {
            pageTitle: `${pageTitle} - Prisoner personal details`,
            errors,
            fieldValue: requestBodyFlash ? requestBodyFlash.editField : height,
            miniBannerData,
          })
        },

        submit: async (req, res) => {
          const { prisonerNumber } = req.params
          const { clientToken } = req.middleware
          const { editField } = req.body
          const user = res.locals.user as PrisonUser

          const height = editField ? parseInt(editField, 10) : 0

          const { height: previousHeight } = await this.personalPageService.getPhysicalAttributes(
            clientToken,
            prisonerNumber,
          )

          return this.submit({
            req,
            res,
            prisonerNumber,
            submit: async () => {
              await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
                height: editField ? height : null,
              })
            },
            fieldData: heightFieldData,
            auditDetails: { fieldName, previous: previousHeight, updated: height },
          })
        },
      },

      imperial: {
        edit: async (req, res) => {
          const { clientToken, prisonerNumber, prisonId, miniBannerData } = getCommonRequestData(req, res)

          const { height } = await this.personalPageService.getPhysicalAttributes(clientToken, prisonerNumber)

          const { feet, inches } =
            height === undefined || height === null
              ? { feet: undefined, inches: undefined }
              : centimetresToFeetAndInches(height)

          const requestBodyFlash = requestBodyFromFlash<{ feet: string; inches: string }>(req)
          const errors = req.flash('errors')

          await this.auditService.sendPageView({
            user: res.locals.user,
            prisonerNumber,
            prisonId,
            correlationId: req.id,
            page: auditEditPageLoad,
          })

          res.render('pages/edit/heightImperial', {
            pageTitle: `${pageTitle} - Prisoner personal details`,
            errors,
            feetValue: requestBodyFlash ? requestBodyFlash.feet : feet,
            inchesValue: requestBodyFlash ? requestBodyFlash.inches : inches,
            miniBannerData,
          })
        },

        submit: async (req, res) => {
          const { prisonerNumber } = req.params
          const { clientToken } = req.middleware
          const user = res.locals.user as PrisonUser
          const { feet: feetString, inches: inchesString }: { feet: string; inches: string } = req.body

          const { height: previousHeight } = await this.personalPageService.getPhysicalAttributes(
            clientToken,
            prisonerNumber,
          )

          const feet = feetString ? parseInt(feetString, 10) : 0
          const inches = inchesString ? parseInt(inchesString, 10) : 0
          const height = feetAndInchesToCentimetres(feet, inches)
          return this.submit({
            req,
            res,
            prisonerNumber,
            submit: async () => {
              await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
                height: !feetString && !inchesString ? null : height,
              })
            },
            fieldData: heightImperialFieldData,
            auditDetails: { fieldName, previous: previousHeight, updated: height },
          })
        },
      },
    }
  }
}
