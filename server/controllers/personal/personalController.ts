import { RequestHandler } from 'express'
import config from '../../config'
import { PrisonUser } from '../../interfaces/HmppsUser'
import PersonalPageService from '../../services/personalPageService'
import CareNeedsService from '../../services/careNeedsService'
import PrisonerPropertyService from '../../services/prisonerPropertyService'
import { mapHeaderData } from '../../mappers/headerMappers'
import { AuditService, Page } from '../../services/auditService'
import {
  changeContactDetailsLinkEnabled,
  editProfileEnabled,
  editProfileSimulateFetch,
  editReligionEnabled,
  propertySummaryTileEnabled,
} from '../../utils/featureFlags'

export default class PersonalController {
  constructor(
    private readonly personalPageService: PersonalPageService,
    private readonly careNeedsService: CareNeedsService,
    private readonly auditService: AuditService,
    private readonly prisonerPropertyService: PrisonerPropertyService,
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

      const [personalPageData, careNeeds, xrays, propertySummary] = await Promise.all([
        this.personalPageService.get(clientToken, prisonerData, {
          editProfileEnabled: editEnabled,
          simulateFetchEnabled,
          personalRelationshipsApiReadEnabled,
          apiErrorCallback,
          personEndpointsEnabled,
        }),
        this.careNeedsService.getCareNeedsAndAdjustments(clientToken, bookingId),
        this.careNeedsService.getXrayBodyScanSummary(clientToken, bookingId),
        this.getPropertySummary(clientToken, prisonerNumber, prisonId),
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
        propertySummary,
        propertyUiUrl: config.serviceUrls.prisonerProperty,
      })
    }
  }

  /**
   * The property summary card replaces the NOMIS-backed property card, but only for prisons the
   * property service has been switched on for. Returns null in every other case — including any
   * failure talking to the property service — so the Personal page falls back to the existing card.
   */
  private async getPropertySummary(clientToken: string, prisonerNumber: string, prisonId: string) {
    if (!propertySummaryTileEnabled()) return null
    if (!(await this.prisonerPropertyService.isPrisonActive(clientToken, prisonId))) return null
    return this.prisonerPropertyService.getPropertySummary(clientToken, prisonerNumber)
  }
}
