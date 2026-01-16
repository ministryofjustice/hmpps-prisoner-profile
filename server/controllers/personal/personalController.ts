import { RequestHandler } from 'express'
import { PrisonUser } from '../../interfaces/HmppsUser'
import PersonalPageService from '../../services/personalPageService'
import CareNeedsService from '../../services/careNeedsService'
import { mapHeaderData } from '../../mappers/headerMappers'
import { AuditService, Page } from '../../services/auditService'
import {
  dietAndAllergyEnabled,
  editProfileEnabled,
  editProfileSimulateFetch,
  editReligionEnabled,
} from '../../utils/featureToggles'
import config from '../../config'

export default class PersonalController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    private readonly careNeedsService: CareNeedsService,
    private readonly auditService: AuditService,
  ) {}

  displayPersonalPage(): RequestHandler {
    return async (req, res) => {
      const { prisonerData, inmateDetail, alertSummaryData, clientToken } = req.middleware
      const { bookingId } = prisonerData
      const { apiErrorCallback, user, prisonerPermissions } = res.locals
      const { activeCaseLoadId } = user as PrisonUser
      const editEnabled = editProfileEnabled(activeCaseLoadId)
      const simulateFetchEnabled = editProfileSimulateFetch(activeCaseLoadId)
      const { personalRelationshipsApiReadEnabled, healthAndMedicationApiReadEnabled, personEndpointsEnabled } =
        config.featureToggles

      const [personalPageData, careNeeds, xrays] = await Promise.all([
        this.personalPageService.get(clientToken, prisonerData, {
          dietAndAllergyIsEnabled: dietAndAllergyEnabled(activeCaseLoadId),
          editProfileEnabled: editEnabled,
          simulateFetchEnabled,
          personalRelationshipsApiReadEnabled,
          apiErrorCallback,
          healthAndMedicationApiReadEnabled,
          personEndpointsEnabled,
        }),
        this.careNeedsService.getCareNeedsAndAdjustments(clientToken, bookingId),
        this.careNeedsService.getXrayBodyScanSummary(clientToken, bookingId),
      ])

      await this.auditService.sendPageView({
        user,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: Page.Personal,
      })

      const hasPersonalId = Object.values(personalPageData.identityNumbers.personal).some(v => v.length > 0)
      const hasHomeOfficeId = Object.values(personalPageData.identityNumbers.homeOffice).some(v => v.length > 0)

      res.render('pages/personalPage', {
        pageTitle: 'Personal',
        ...mapHeaderData(prisonerData, inmateDetail, alertSummaryData, prisonerPermissions, 'personal'),
        ...personalPageData,
        changeEyeColourUrl:
          personalPageData.physicalCharacteristics.getOrNull()?.leftEyeColour ===
          personalPageData.physicalCharacteristics.getOrNull()?.rightEyeColour
            ? 'personal/eye-colour'
            : 'personal/eye-colour-individual',
        careNeeds: careNeeds.filter(need => need.isOngoing).sort((a, b) => b.startDate?.localeCompare(a.startDate)),
        security: { ...personalPageData.security, xrays },
        hasPastCareNeeds: careNeeds.some(need => !need.isOngoing),
        editEnabled,
        displayNewAddressesCard: editEnabled,
        dietAndAllergiesEnabled:
          dietAndAllergyEnabled(activeCaseLoadId) && dietAndAllergyEnabled(prisonerData.prisonId),
        editReligionEnabled: editEnabled || editReligionEnabled(),
        personalRelationshipsApiReadEnabled,
        hasPersonalId,
        hasHomeOfficeId,
        useCustomErrorBanner: true,
      })
    }
  }
}
