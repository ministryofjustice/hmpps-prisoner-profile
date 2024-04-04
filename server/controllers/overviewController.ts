import { Request, Response } from 'express'
import { mapHeaderData } from '../mappers/headerMappers'
import OverviewPageService from '../services/overviewPageService'
import { canAddCaseNotes, canViewCaseNotes } from '../utils/roleHelpers'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import config from '../config'
import { User } from '../data/hmppsAuthClient'
import { formatName, prisonerBelongsToUsersCaseLoad, userHasRoles } from '../utils/utils'
import { Role } from '../data/enums/role'
import Nominal from '../data/interfaces/manageSocCasesApi/Nominal'
import { PathfinderApiClient } from '../data/interfaces/pathfinderApi/pathfinderApiClient'
import { ManageSocCasesApiClient } from '../data/interfaces/manageSocCasesApi/manageSocCasesApiClient'
import { RestClientBuilder } from '../data'
import InmateDetail from '../data/interfaces/prisonApi/InmateDetail'
import buildOverviewActions from './utils/buildOverviewActions'
import { AuditService, Page } from '../services/auditService'
import logger from '../../logger'
import OffencesService from '../services/offencesService'
import OverviewPageData from './interfaces/OverviewPageData'
import mapCourtCaseSummary from './mappers/mapCourtCaseSummary'

/**
 * Parse request for overview page and orchestrate response
 */
export default class OverviewController {
  constructor(
    private readonly overviewPageService: OverviewPageService,
    private readonly pathfinderApiClientBuilder: RestClientBuilder<PathfinderApiClient>,
    private readonly manageSocCasesApiClientBuilder: RestClientBuilder<ManageSocCasesApiClient>,
    private readonly auditService: AuditService,
    private readonly offencesService: OffencesService,
  ) {}

  public async displayOverview(req: Request, res: Response, prisonerData: Prisoner, inmateDetail: InmateDetail) {
    const { clientToken } = res.locals
    const { userRoles } = res.locals.user
    const pathfinderApiClient = this.pathfinderApiClientBuilder(clientToken)
    const manageSocCasesApiClient = this.manageSocCasesApiClientBuilder(clientToken)
    const showCourtCaseSummary =
      config.featureToggles.courCasesSummaryEnabled &&
      userHasRoles([Role.ReleaseDatesCalculator], res.locals.user.userRoles)

    const [
      overviewPageData,
      pathfinderNominal,
      socNominal,
      nextCourtAppearance,
      activeCourtCasesCount,
      latestReleaseDate,
    ] = await Promise.all([
      this.overviewPageService.get({
        clientToken,
        prisonerData,
        staffId: res.locals.user.staffId,
        inmateDetail,
        apiErrorCallback: res.locals.apiErrorCallback,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
      }),
      pathfinderApiClient.getNominal(prisonerData.prisonerNumber),
      manageSocCasesApiClient.getNominal(prisonerData.prisonerNumber),
      this.offencesService.getNextCourtHearingSummary(clientToken, prisonerData.bookingId),
      this.offencesService.getActiveCourtCasesCount(clientToken, prisonerData.bookingId),
      showCourtCaseSummary
        ? this.offencesService.getLatestReleaseCalculation(clientToken, prisonerData.prisonerNumber)
        : null,
    ])

    const overviewActions = buildOverviewActions(
      prisonerData,
      pathfinderNominal,
      socNominal,
      res.locals.user,
      overviewPageData.staffRoles ?? [],
      config,
      res.locals.feComponentsMeta,
    )

    const overviewInfoLinks = this.buildOverviewInfoLinks(prisonerData, pathfinderNominal, socNominal, res.locals.user)

    // Set role based permissions
    const canView = canViewCaseNotes(res.locals.user, prisonerData)
    const canAdd = canAddCaseNotes(res.locals.user, prisonerData)

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

    const viewData: OverviewPageData = {
      pageTitle: 'Overview',
      ...mapHeaderData(prisonerData, inmateDetail, res.locals.user, 'overview'),
      ...overviewPageData,
      overviewActions,
      overviewInfoLinks,
      canView,
      canAdd,
      courtCaseSummary: mapCourtCaseSummary(
        nextCourtAppearance,
        activeCourtCasesCount,
        latestReleaseDate,
        userRoles,
        prisonerData.prisonerNumber,
      ),
      prisonerDisplayName: formatName(prisonerData.firstName, null, prisonerData.lastName),
      options: {
        showCourtCaseSummary,
      },
    }

    res.render('pages/overviewPage', viewData)
  }

  private buildOverviewInfoLinks(
    prisonerData: Prisoner,
    pathfinderNominal: Nominal,
    socNominal: Nominal,
    user: User,
  ): { text: string; url: string; dataQA: string }[] {
    const links: { text: string; url: string; dataQA: string }[] = []

    if (
      userHasRoles([Role.PomUser, Role.ViewProbationDocuments], user.userRoles) &&
      (prisonerBelongsToUsersCaseLoad(prisonerData.prisonId, user.caseLoads) ||
        ['OUT', 'TRN'].includes(prisonerData.prisonId))
    ) {
      links.push({
        text: 'Probation documents',
        url: `/prisoner/${prisonerData.prisonerNumber}/probation-documents`,
        dataQA: 'probation-documents-info-link',
      })
    }

    if (
      userHasRoles(
        [
          Role.PathfinderApproval,
          Role.PathfinderStdPrison,
          Role.PathfinderStdProbation,
          Role.PathfinderHQ,
          Role.PathfinderUser,
          Role.PathfinderLocalReader,
          Role.PathfinderNationalReader,
          Role.PathfinderPolice,
          Role.PathfinderPsychologist,
        ],
        user.userRoles,
      ) &&
      pathfinderNominal
    ) {
      links.push({
        text: 'Pathfinder profile',
        url: `${config.serviceUrls.pathfinder}/nominal/${pathfinderNominal.id}`,
        dataQA: 'pathfinder-profile-info-link',
      })
    }

    if (userHasRoles([Role.SocCommunity, Role.SocCustody], user.userRoles) && socNominal) {
      links.push({
        text: 'SOC profile',
        url: `${config.serviceUrls.manageSocCases}/nominal/${socNominal.id}`,
        dataQA: 'soc-profile-info-link',
      })
    }

    return links
  }
}
