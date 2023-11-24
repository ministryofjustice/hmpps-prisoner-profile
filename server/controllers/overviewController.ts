import { Request, Response } from 'express'
import { mapHeaderData } from '../mappers/headerMappers'
import { PrisonerSearchService } from '../services'
import OverviewPageService from '../services/overviewPageService'
import { canAddCaseNotes, canViewCaseNotes } from '../utils/roleHelpers'
import { Prisoner } from '../interfaces/prisoner'
import config from '../config'
import { User } from '../data/hmppsAuthClient'
import { prisonerBelongsToUsersCaseLoad, userHasRoles } from '../utils/utils'
import { Role } from '../data/enums/role'
import { Nominal } from '../interfaces/pathfinderApi/nominal'
import { PathfinderApiClient } from '../data/interfaces/pathfinderApiClient'
import { ManageSocCasesApiClient } from '../data/interfaces/manageSocCasesApiClient'
import { RestClientBuilder } from '../data'
import { InmateDetail } from '../interfaces/prisonApi/inmateDetail'
import buildOverviewActions from './utils/buildOverviewActions'

/**
 * Parse request for overview page and orchestrate response
 */
export default class OverviewController {
  constructor(
    private readonly prisonerSearchService: PrisonerSearchService,
    private readonly overviewPageService: OverviewPageService,
    private readonly pathfinderApiClientBuilder: RestClientBuilder<PathfinderApiClient>,
    private readonly manageSocCasesApiClientBuilder: RestClientBuilder<ManageSocCasesApiClient>,
  ) {}

  public async displayOverview(req: Request, res: Response, prisonerData: Prisoner, inmateDetail: InmateDetail) {
    const { clientToken } = res.locals
    const pathfinderApiClient = this.pathfinderApiClientBuilder(clientToken)
    const manageSocCasesApiClient = this.manageSocCasesApiClientBuilder(clientToken)

    const [overviewPageData, pathfinderNominal, socNominal] = await Promise.all([
      this.overviewPageService.get(
        clientToken,
        prisonerData,
        res.locals.user.staffId,
        res.locals.user.caseLoads,
        res.locals.user.userRoles,
      ),
      pathfinderApiClient.getNominal(prisonerData.prisonerNumber),
      manageSocCasesApiClient.getNominal(prisonerData.prisonerNumber),
    ])

    const overviewActions = buildOverviewActions(
      prisonerData,
      pathfinderNominal,
      socNominal,
      res.locals.user,
      overviewPageData.staffRoles ?? [],
      config,
    )

    const overviewInfoLinks = this.buildOverviewInfoLinks(prisonerData, pathfinderNominal, socNominal, res.locals.user)

    // Set role based permissions
    const canView = canViewCaseNotes(res.locals.user, prisonerData)
    const canAdd = canAddCaseNotes(res.locals.user, prisonerData)

    res.render('pages/overviewPage', {
      pageTitle: 'Overview',
      ...mapHeaderData(prisonerData, inmateDetail, res.locals.user, 'overview'),
      ...overviewPageData,
      overviewActions,
      overviewInfoLinks,
      canView,
      canAdd,
    })
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
        url: `${config.serviceUrls.digitalPrison}/offenders/${prisonerData.prisonerNumber}/probation-documents`,
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
