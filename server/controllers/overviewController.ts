import { Request, Response } from 'express'
import { mapHeaderData } from '../mappers/headerMappers'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import config from '../config'
import { formatName, isInUsersCaseLoad } from '../utils/utils'
import { PathfinderApiClient } from '../data/interfaces/pathfinderApi/pathfinderApiClient'
import { ManageSocCasesApiClient } from '../data/interfaces/manageSocCasesApi/manageSocCasesApiClient'
import { RestClientBuilder } from '../data'
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
import PersonalPageService from '../services/personalPageService'
import { Result } from '../utils/result/result'
import OffenderService from '../services/offenderService'
import ProfessionalContactsService from '../services/professionalContactsService'
import { youthEstatePrisons } from '../data/constants/youthEstatePrisons'
import getOverviewStatuses from './utils/overviewController/getOverviewStatuses'
import buildOverviewInfoLinks from './utils/overviewController/buildOverviewInfoLinks'
import getPersonalDetails from './utils/overviewController/getPersonalDetails'
import getCsraSummary from './utils/overviewController/getCsraSummary'
import getCategorySummary from './utils/overviewController/getCategorySummary'
import CsipService from '../services/csipService'
import { isServiceEnabled } from '../utils/isServiceEnabled'
import ContactsService from '../services/contactsService'
import { externalContactsEnabled } from '../utils/featureToggles'

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
    private readonly personalPageService: PersonalPageService,
    private readonly offenderService: OffenderService,
    private readonly professionalContactsService: ProfessionalContactsService,
    private readonly csipService: CsipService,
    private readonly contactsService: ContactsService,
  ) {}

  public async displayOverview(req: Request, res: Response) {
    const { clientToken, prisonerData, inmateDetail, alertSummaryData, permissions } = req.middleware
    const { prisonId, bookingId, prisonerNumber, prisonName } = prisonerData
    const { courCasesSummaryEnabled } = config.featureToggles

    const prisonerInCaseLoad = isInUsersCaseLoad(prisonId, res.locals.user)
    const isYouthPrisoner = youthEstatePrisons.includes(prisonId)

    const pathfinderApiClient = this.pathfinderApiClientBuilder(clientToken)
    const manageSocCasesApiClient = this.manageSocCasesApiClientBuilder(clientToken)
    const showCourtCaseSummary = courCasesSummaryEnabled && permissions.courtCases?.view

    const [
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
      currentCsipDetail,
      externalContactsSummary,
    ] = await Promise.all([
      pathfinderApiClient.getNominal(prisonerNumber),
      manageSocCasesApiClient.getNominal(prisonerNumber),
      this.offencesService.getNextCourtHearingSummary(clientToken, bookingId),
      this.offencesService.getActiveCourtCasesCount(clientToken, bookingId),
      showCourtCaseSummary ? this.offencesService.getLatestReleaseCalculation(clientToken, prisonerNumber) : null,
      permissions.money?.view ? this.moneyService.getAccountBalances(clientToken, bookingId) : null,
      permissions.adjudications?.view
        ? Result.wrap(
            this.adjudicationsService.getAdjudicationsOverview(clientToken, bookingId),
            res.locals.apiErrorCallback,
          )
        : null,
      permissions.visits?.view ? this.visitsService.getVisitsOverview(clientToken, bookingId, prisonerNumber) : null,
      this.prisonerScheduleService.getScheduleOverview(clientToken, bookingId),
      permissions.incentives?.view ? this.incentivesService.getIncentiveOverview(clientToken, bookingId) : null,
      Result.wrap(
        this.personalPageService.getLearnerNeurodivergence(prisonId, prisonerNumber),
        res.locals.apiErrorCallback,
      ),
      this.prisonerScheduleService.getScheduledTransfers(clientToken, prisonerNumber),
      this.offenderService.getPrisoner(clientToken, prisonerNumber),
      this.professionalContactsService.getProfessionalContactsOverview(
        clientToken,
        prisonerData,
        res.locals.apiErrorCallback,
      ),
      this.offencesService.getOffencesOverview(clientToken, bookingId, prisonerNumber),
      Result.wrap(
        this.offenderService.getPrisonerNonAssociationOverview(clientToken, prisonerNumber),
        res.locals.apiErrorCallback,
      ),
      isServiceEnabled('csipUI', res.locals.feComponents?.sharedData) && permissions.csip?.view
        ? Result.wrap(this.csipService.getCurrentCsip(clientToken, prisonerNumber), res.locals.apiErrorCallback)
        : null,
      externalContactsEnabled(prisonId)
        ? Result.wrap(
            this.contactsService.getExternalContactsCount(clientToken, prisonerNumber),
            res.locals.apiErrorCallback,
          )
        : null,
    ])

    const overviewActions = buildOverviewActions(
      prisonerData,
      pathfinderNominal,
      socNominal,
      res.locals.user,
      config,
      res.locals.feComponents?.sharedData,
      permissions,
    )

    this.auditOverviewPageView(req, res, prisonerData)

    const viewData: OverviewPageData = {
      pageTitle: 'Overview',
      ...mapHeaderData(prisonerData, inmateDetail, alertSummaryData, res.locals.user, 'overview'),
      moneySummary,
      adjudicationSummary,
      visitsSummary,
      currentCsipDetail,
      categorySummary: getCategorySummary(prisonerData, inmateDetail, permissions.category?.edit),
      csraSummary: getCsraSummary(prisonerData),
      schedule,
      incentiveSummary,
      overviewActions,
      overviewInfoLinks: buildOverviewInfoLinks(prisonerData, pathfinderNominal, socNominal, permissions),
      courtCaseSummary: mapCourtCaseSummary(
        nextCourtAppearance,
        activeCourtCasesCount,
        latestReleaseDate,
        permissions.courtCases?.edit,
        prisonerData.prisonerNumber,
      ),
      statuses: getOverviewStatuses(prisonerData, inmateDetail, learnerNeurodivergence, scheduledTransfers),
      prisonerDisplayName: formatName(inmateDetail.firstName, null, inmateDetail.lastName),
      prisonerInCaseLoad,
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
      externalContactsSummary,
      options: {
        showCourtCaseSummary,
      },
    }

    res.render('pages/overviewPage', viewData)
  }

  private auditOverviewPageView = (req: Request, res: Response, prisonerData: Prisoner) => {
    this.auditService
      .sendPageView({
        user: res.locals.user,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: Page.Overview,
      })
      .catch(error => logger.error(error))
  }
}
