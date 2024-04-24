import { Request, Response } from 'express'
import { mapHeaderData } from '../mappers/headerMappers'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import config from '../config'
import { formatName, neurodiversityEnabled, prisonerBelongsToUsersCaseLoad, userHasRoles } from '../utils/utils'
import { Role } from '../data/enums/role'
import { PathfinderApiClient } from '../data/interfaces/pathfinderApi/pathfinderApiClient'
import { ManageSocCasesApiClient } from '../data/interfaces/manageSocCasesApi/manageSocCasesApiClient'
import { RestClientBuilder } from '../data'
import InmateDetail from '../data/interfaces/prisonApi/InmateDetail'
import buildOverviewActions from './utils/overviewController/buildOverviewActions'
import { AuditService, Page } from '../services/auditService'
import logger from '../../logger'
import OffencesService from '../services/offencesService'
import OverviewPageData from './interfaces/OverviewPageData'
import mapCourtCaseSummary from './utils/overviewController/mapCourtCaseSummary'
import MoneyService from '../services/moneyService'
import AdjudicationsService from '../services/adjudicationsService'
import { VisitsService } from '../services/visitsService'
import PrisonerScheduleService from '../services/prisonerScheduleService'
import IncentivesService from '../services/incentivesService'
import { UserService } from '../services'
import PersonalPageService from '../services/personalPageService'
import { Result } from '../utils/result/result'
import LearnerNeurodivergence from '../data/interfaces/curiousApi/LearnerNeurodivergence'
import OffenderService from '../services/offenderService'
import ProfessionalContactsService from '../services/professionalContactsService'
import { youthEstatePrisons } from '../data/constants/youthEstatePrisons'
import getOverviewStatuses from './utils/overviewController/getOverviewStatuses'
import buildOverviewInfoLinks from './utils/overviewController/buildOverviewInfoLinks'
import getPersonalDetails from './utils/overviewController/getPersonalDetails'
import getCsraSummary from './utils/overviewController/getCsraSummary'
import getCategorySummary from './utils/overviewController/getCategorySummary'
import StaffRole from '../data/interfaces/prisonApi/StaffRole'

/**
 * Parse request for overview page and orchestrate response
 */
export default class OverviewController {
  constructor(
    private readonly pathfinderApiClientBuilder: RestClientBuilder<PathfinderApiClient>,
    private readonly manageSocCasesApiClientBuilder: RestClientBuilder<ManageSocCasesApiClient>,
    private readonly auditService: AuditService,
    private readonly offencesService: OffencesService,
    private readonly moneyService: MoneyService,
    private readonly adjudicationsService: AdjudicationsService,
    private readonly visitsService: VisitsService,
    private readonly prisonerScheduleService: PrisonerScheduleService,
    private readonly incentivesService: IncentivesService,
    private readonly userService: UserService,
    private readonly personalPageService: PersonalPageService,
    private readonly offenderService: OffenderService,
    private readonly professionalContactsService: ProfessionalContactsService,
  ) {}

  public async displayOverview(req: Request, res: Response, prisonerData: Prisoner, inmateDetail: InmateDetail) {
    const { clientToken } = req.middleware
    const { userRoles, caseLoads, staffId, activeCaseLoadId } = res.locals.user
    const { prisonId, bookingId, prisonerNumber, prisonName } = prisonerData
    const { courCasesSummaryEnabled } = config.featureToggles

    const belongsToCaseLoad = prisonerBelongsToUsersCaseLoad(prisonId, caseLoads)
    const isPomOrReceptionUser = userHasRoles([Role.PomUser, Role.ReceptionUser], userRoles)
    const isGlobalSearchUser = userHasRoles([Role.GlobalSearch], userRoles)
    const isYouthPrisoner = youthEstatePrisons.includes(prisonId)

    const pathfinderApiClient = this.pathfinderApiClientBuilder(clientToken)
    const manageSocCasesApiClient = this.manageSocCasesApiClientBuilder(clientToken)
    const showCourtCaseSummary = courCasesSummaryEnabled && userHasRoles([Role.ReleaseDatesCalculator], userRoles)

    const [
      staffRoles,
      pathfinderNominal,
      socNominal,
      nextCourtAppearance,
      activeCourtCasesCount,
      latestReleaseDate,
      moneySummary,
      adjudicationSummary,
      visitsSummary,
      schedule,
      incentiveSummary,
      learnerNeurodivergence,
      scheduledTransfers,
      prisonerDetail,
      staffContacts,
      offencesOverview,
      nonAssociationSummary,
    ] = await Promise.all([
      activeCaseLoadId ? this.userService.getStaffRoles(clientToken, staffId, activeCaseLoadId) : ([] as StaffRole[]),
      pathfinderApiClient.getNominal(prisonerNumber),
      manageSocCasesApiClient.getNominal(prisonerNumber),
      this.offencesService.getNextCourtHearingSummary(clientToken, bookingId),
      this.offencesService.getActiveCourtCasesCount(clientToken, bookingId),
      showCourtCaseSummary ? this.offencesService.getLatestReleaseCalculation(clientToken, prisonerNumber) : null,
      belongsToCaseLoad ? this.moneyService.getAccountBalances(clientToken, bookingId) : null,
      belongsToCaseLoad || isPomOrReceptionUser
        ? await this.adjudicationsService.getAdjudicationsOverview(clientToken, bookingId)
        : null,
      belongsToCaseLoad ? await this.visitsService.getVisitsOverview(clientToken, bookingId, prisonerNumber) : null,
      await this.prisonerScheduleService.getScheduleOverview(clientToken, bookingId),
      belongsToCaseLoad || isGlobalSearchUser
        ? await this.incentivesService.getIncentiveOverview(clientToken, bookingId)
        : null,
      Result.wrap(this.getLearnerNeurodivergence(clientToken, prisonId, prisonerNumber), res.locals.apiErrorCallback),
      this.prisonerScheduleService.getScheduledTransfers(clientToken, prisonerNumber),
      this.offenderService.getPrisoner(clientToken, prisonerNumber),
      this.professionalContactsService.getProfessionalContactsOverview(
        clientToken,
        prisonerData,
        res.locals.apiErrorCallback,
      ),
      this.offencesService.getOffencesOverview(clientToken, bookingId, prisonerNumber),
      this.offenderService.getPrisonerNonAssociationOverview(clientToken, prisonerNumber),
    ])

    const overviewActions = buildOverviewActions(
      prisonerData,
      pathfinderNominal,
      socNominal,
      res.locals.user,
      staffRoles,
      config,
      res.locals.feComponentsMeta,
    )

    this.auditOverviewPageView(req, res, prisonerData)

    const viewData: OverviewPageData = {
      pageTitle: 'Overview',
      ...mapHeaderData(prisonerData, inmateDetail, res.locals.user, 'overview'),
      moneySummary,
      adjudicationSummary,
      visitsSummary,
      categorySummary: getCategorySummary(prisonerData, inmateDetail, userRoles),
      csraSummary: getCsraSummary(prisonerData),
      schedule,
      incentiveSummary,
      overviewActions,
      overviewInfoLinks: buildOverviewInfoLinks(prisonerData, pathfinderNominal, socNominal, res.locals.user),
      courtCaseSummary: mapCourtCaseSummary(
        nextCourtAppearance,
        activeCourtCasesCount,
        latestReleaseDate,
        userRoles,
        prisonerData.prisonerNumber,
      ),
      statuses: getOverviewStatuses(prisonerData, inmateDetail, learnerNeurodivergence, scheduledTransfers),
      prisonerDisplayName: formatName(prisonerData.firstName, null, prisonerData.lastName),
      prisonerInCaseload: prisonerBelongsToUsersCaseLoad(prisonerData.prisonId, res.locals.user.caseLoads),
      bookingId: prisonerData.bookingId,
      personalDetails: getPersonalDetails(prisonerData, inmateDetail, prisonerDetail),
      staffContacts,
      isYouthPrisoner,
      prisonName,
      offencesOverview: {
        ...offencesOverview,
        imprisonmentStatusDescription: prisonerData.imprisonmentStatusDescription,
        confirmedReleaseDate: prisonerData.confirmedReleaseDate,
        conditionalReleaseDate: prisonerData.conditionalReleaseDate,
      },
      nonAssociationSummary,
      options: {
        showCourtCaseSummary,
      },
    }

    res.render('pages/overviewPage', viewData)
  }

  private getLearnerNeurodivergence = async (
    clientToken: string,
    prisonId: string,
    prisonerNumber: string,
  ): Promise<LearnerNeurodivergence[]> => {
    if (!neurodiversityEnabled(prisonId)) return []
    return this.personalPageService.getLearnerNeurodivergence(clientToken, prisonerNumber)
  }

  private auditOverviewPageView = (req: Request, res: Response, prisonerData: Prisoner) => {
    this.auditService
      .sendPageView({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: Page.Overview,
      })
      .catch(error => logger.error(error))
  }
}
