import { weightFieldData, weightImperialFieldData } from '../../fieldData'
import getCommonRequestData from '../../../../utils/getCommonRequestData'
import { requestBodyFromFlash } from '../../../../utils/requestBodyFromFlash'
import { AuditService } from '../../../../services/auditService'
import { PrisonUser } from '../../../../interfaces/HmppsUser'
import { kilogramsToStoneAndPounds, stoneAndPoundsToKilograms } from '../../../../utils/unitConversions'
import PersonalEditController from '../personalEditController'
import PersonalPageService from '../../../../services/personalPageService'
import { EditControllerRequestHandlers } from '../../../interfaces/EditControllerRequestHandlers'

export default class WeightController extends PersonalEditController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    protected readonly auditService: AuditService,
  ) {
    super(auditService)
  }

  metric(): EditControllerRequestHandlers {
    const { pageTitle, fieldName, auditEditPageLoad } = weightFieldData

    return {
      edit: async (req, res) => {
        const { clientToken, prisonerNumber, prisonId, miniBannerData } = getCommonRequestData(req, res)
        const requestBodyFlash = requestBodyFromFlash<{ kilograms: string }>(req)
        const errors = req.flash('errors')

        const { weight } = await this.personalPageService.getPhysicalAttributes(clientToken, prisonerNumber)

        await this.auditService.sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: auditEditPageLoad,
        })

        res.render('pages/edit/weightMetric', {
          pageTitle: `${pageTitle} - Prisoner personal details`,
          errors,
          fieldValue: requestBodyFlash ? requestBodyFlash.kilograms : weight,
          miniBannerData,
        })
      },

      submit: async (req, res) => {
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const { kilograms } = req.body
        const weight = parseInt(kilograms, 10)

        const { weight: previousWeight } = await this.personalPageService.getPhysicalAttributes(
          clientToken,
          prisonerNumber,
        )

        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
              weight: kilograms ? weight : null,
            })
          },
          fieldData: weightFieldData,
          auditDetails: { fieldName, previous: previousWeight, updated: weight },
        })
      },
    }
  }

  imperial(): EditControllerRequestHandlers {
    const { pageTitle, fieldName, auditEditPageLoad } = weightFieldData

    return {
      edit: async (req, res) => {
        const { clientToken, prisonerNumber, prisonId, miniBannerData } = getCommonRequestData(req, res)

        const { weight } = await this.personalPageService.getPhysicalAttributes(clientToken, prisonerNumber)

        const { stone, pounds, poundsOnly } =
          weight === undefined || weight === null
            ? { stone: undefined, pounds: undefined, poundsOnly: undefined }
            : kilogramsToStoneAndPounds(weight)

        const requestBodyFlash = requestBodyFromFlash<{
          stone: string
          pounds: string
          poundsOnly: string
          imperialWeightOption: string
        }>(req)

        const errors = req.flash('errors')

        await this.auditService.sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: auditEditPageLoad,
        })

        res.render('pages/edit/weightImperial', {
          pageTitle: `${pageTitle} - Prisoner personal details`,
          errors,
          stoneValue: requestBodyFlash ? requestBodyFlash.stone : stone,
          poundsValue: requestBodyFlash ? requestBodyFlash.pounds : pounds,
          poundsOnlyValue: requestBodyFlash ? requestBodyFlash.poundsOnly : poundsOnly,
          imperialWeightOption: requestBodyFlash ? requestBodyFlash.imperialWeightOption : 'stoneAndPounds',
          miniBannerData,
        })
      },

      submit: async (req, res) => {
        const { prisonerNumber } = req.params
        const { clientToken } = req.middleware
        const user = res.locals.user as PrisonUser
        const {
          stone: stoneString,
          pounds: poundsString,
          poundsOnly: poundsOnlyString,
          imperialWeightOption,
        }: { stone: string; pounds: string; poundsOnly: string; imperialWeightOption: string } = req.body

        const { weight: previousWeight } = await this.personalPageService.getPhysicalAttributes(
          clientToken,
          prisonerNumber,
        )

        const stoneAndPoundsUsed = imperialWeightOption === 'stoneAndPounds'
        const stone = stoneString ? parseInt(stoneString, 10) : 0
        const pounds = poundsString ? parseInt(poundsString, 10) : 0
        const poundsOnly = poundsOnlyString && poundsOnlyString ? parseInt(poundsOnlyString, 10) : 0

        const weight = stoneAndPoundsToKilograms(
          stoneAndPoundsUsed ? stone : 0,
          stoneAndPoundsUsed ? pounds : poundsOnly,
        )

        return this.submit({
          req,
          res,
          prisonerNumber,
          submit: async () => {
            await this.personalPageService.updatePhysicalAttributes(clientToken, user, prisonerNumber, {
              weight: !stoneString && !poundsString && !poundsOnlyString ? null : weight,
            })
          },
          fieldData: weightImperialFieldData,
          auditDetails: { fieldName, previous: previousWeight, updated: weight },
        })
      },
    }
  }
}
