import type { RequestHandler } from 'express'
import config from '../../config'
import type { PrisonUser } from '../../interfaces/HmppsUser'
import { mapHeaderData } from '../../mappers/headerMappers'
import {
  changeContactDetailsLinkEnabled,
  editProfileEnabled,
  editProfileSimulateFetch,
  editReligionEnabled,
} from '../../utils/featureFlags'
import { type AuditService, Page } from '../../services/auditService'
import type CareNeedsService from '../../services/careNeedsService'
import type PersonalPageService from '../../services/personalPageService'
import type { XRayBodyScansAvailabilityService } from '../../services/xRayBodyScansAvailabilityService'

export default class PersonalController {
  constructor(
    private readonly auditService: AuditService,
    private readonly careNeedsService: CareNeedsService,
    private readonly personalPageService: PersonalPageService,
    private readonly xRayBodyScansAvailabilityService: XRayBodyScansAvailabilityService,
  ) {}

  displayPersonalPage(): RequestHandler {
    return async (req, res) => {
      const { prisonerData, inmateDetail, alertSummaryData, clientToken } = req.middleware
      const { prisonId, prisonerNumber, bookingId } = prisonerData
      const { apiErrorCallback, user, prisonerPermissions } = res.locals
      const { activeCaseLoadId } = user as PrisonUser

      const editEnabled = editProfileEnabled(activeCaseLoadId)
      const changeContactLinkEnabled = changeContactDetailsLinkEnabled(activeCaseLoadId)
      const simulateFetchEnabled = editProfileSimulateFetch(activeCaseLoadId)
      const { personalRelationshipsApiReadEnabled, personEndpointsEnabled } = config.featureToggles
      const xrayBodyScansMoved = await this.xRayBodyScansAvailabilityService
        .getAvailability(req, res)
        .then(this.xRayBodyScansAvailabilityService.showOverviewCard)

      const [personalPageData, careNeeds, xrays] = await Promise.all([
        this.personalPageService.get(clientToken, prisonerData, {
          editProfileEnabled: editEnabled,
          simulateFetchEnabled,
          personalRelationshipsApiReadEnabled,
          apiErrorCallback,
          personEndpointsEnabled,
        }),
        this.careNeedsService.getCareNeedsAndAdjustments(clientToken, bookingId),
        xrayBodyScansMoved ? null : this.careNeedsService.getXrayBodyScanSummary(clientToken, bookingId),
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
        security: { ...personalPageData.security, xrays },
        hasPastCareNeeds: careNeeds.some(need => !need.isOngoing),
        editEnabled,
        displayNewAddressesCard: editEnabled,
        editReligionEnabled: editEnabled || editReligionEnabled(),
        personalRelationshipsApiReadEnabled,
        hasPersonalId,
        hasHomeOfficeId,
        useCustomErrorBanner: true,
        changeContactLinkEnabled,
        xrayBodyScansMoved,
      })
    }
  }
}
