import { RequestHandler } from 'express'
import config from '../../config'
import { Role } from '../../data/enums/role'
import { PrisonUser } from '../../interfaces/HmppsUser'
import PersonalPageService from '../../services/personalPageService'
import CareNeedsService from '../../services/careNeedsService'
import { mapHeaderData } from '../../mappers/headerMappers'
import { AuditService, Page } from '../../services/auditService'
import {
  changeContactDetailsLinkEnabled,
  editProfileEnabled,
  editProfileSimulateFetch,
  editReligionEnabled,
} from '../../utils/featureFlags'

export default class PersonalController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    private readonly careNeedsService: CareNeedsService,
    private readonly auditService: AuditService,
  ) {}

  displayPersonalPage(): RequestHandler {
    return async (req, res) => {
      const { prisonerData, inmateDetail, alertSummaryData, clientToken } = req.middleware
      const { prisonId, prisonerNumber, bookingId } = prisonerData
      const { apiErrorCallback, user, prisonerPermissions } = res.locals
      const { activeCaseLoadId, userRoles } = user as PrisonUser
      const editEnabled = editProfileEnabled(activeCaseLoadId)
      const changeContactLinkEnabled = changeContactDetailsLinkEnabled(activeCaseLoadId)
      const simulateFetchEnabled = editProfileSimulateFetch(activeCaseLoadId)
      const { personalRelationshipsApiReadEnabled, personEndpointsEnabled } = config.featureToggles

      const showUnsafeXRayBodyScanData =
        config.environment !== 'prod' && userRoles.includes(Role.DpsApplicationDeveloper)

      const [personalPageData, careNeeds, xrays, unsafeXrays] = await Promise.all([
        this.personalPageService.get(clientToken, prisonerData, {
          editProfileEnabled: editEnabled,
          simulateFetchEnabled,
          personalRelationshipsApiReadEnabled,
          apiErrorCallback,
          personEndpointsEnabled,
        }),
        this.careNeedsService.getCareNeedsAndAdjustments(clientToken, bookingId),
        this.careNeedsService.getXrayBodyScanSummary(clientToken, bookingId),
        showUnsafeXRayBodyScanData
          ? this.careNeedsService.unsafeGetXrayBodyScanSummary(clientToken, prisonerNumber)
          : Promise.resolve({ total: 0, since: '' }),
      ])

      await this.auditService.sendPageView({
        user,
        prisonerNumber,
        prisonId,
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
        security: { ...personalPageData.security, xrays, unsafeXrays },
        hasPastCareNeeds: careNeeds.some(need => !need.isOngoing),
        editEnabled,
        displayNewAddressesCard: editEnabled,
        editReligionEnabled: editEnabled || editReligionEnabled(),
        personalRelationshipsApiReadEnabled,
        hasPersonalId,
        hasHomeOfficeId,
        useCustomErrorBanner: true,
        showEditProfileBanner: editEnabled,
        changeContactLinkEnabled,
      })
    }
  }
}
