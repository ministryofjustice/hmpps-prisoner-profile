import { Request, Response } from 'express'
import { mapHeaderData } from '../mappers/headerMappers'
import { PrisonerSearchService } from '../services'
import OverviewPageService from '../services/overviewPageService'
import { canAddCaseNotes, canViewCalculateReleaseDates, canViewCaseNotes } from '../utils/roleHelpers'
import { Prisoner } from '../interfaces/prisoner'
import { HmppsAction } from '../interfaces/hmppsAction'
import { Icon } from '../data/enums/icon'
import config from '../config'
import { User } from '../data/hmppsAuthClient'
import { prisonerBelongsToUsersCaseLoad, userCanEdit, userHasRoles } from '../utils/utils'
import { Role } from '../data/enums/role'
import { Nominal } from '../interfaces/pathfinderApi/nominal'
import { PathfinderApiClient } from '../data/interfaces/pathfinderApiClient'
import { ManageSocCasesApiClient } from '../data/interfaces/manageSocCasesApiClient'
import { RestClientBuilder } from '../data'
import { InmateDetail } from '../interfaces/prisonApi/inmateDetail'

/**
 * Parse request for overview page and orchestrate response
 */
export default class OverviewController {
  private pathfinderApiClient: PathfinderApiClient

  private manageSocCasesApiClient: ManageSocCasesApiClient

  constructor(
    private readonly prisonerSearchService: PrisonerSearchService,
    private readonly overviewPageService: OverviewPageService,
    private readonly pathfinderApiClientBuilder: RestClientBuilder<PathfinderApiClient>,
    private readonly manageSocCasesApiClientBuilder: RestClientBuilder<ManageSocCasesApiClient>,
  ) {}

  public async displayOverview(req: Request, res: Response, prisonerData: Prisoner, inmateDetail: InmateDetail) {
    const { clientToken } = res.locals
    this.pathfinderApiClient = this.pathfinderApiClientBuilder(clientToken)
    this.manageSocCasesApiClient = this.manageSocCasesApiClientBuilder(clientToken)

    const [overviewPageData, pathfinderNominal, socNominal] = await Promise.all([
      this.overviewPageService.get(
        clientToken,
        prisonerData,
        res.locals.user.staffId,
        res.locals.user.caseLoads,
        res.locals.user.userRoles,
      ),
      this.pathfinderApiClient.getNominal(prisonerData.prisonerNumber),
      this.manageSocCasesApiClient.getNominal(prisonerData.prisonerNumber),
    ])

    const overviewActions = this.buildOverviewActions(
      prisonerData,
      pathfinderNominal,
      socNominal,
      res.locals.user,
      overviewPageData.staffRoles,
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

  private buildOverviewActions(
    prisonerData: Prisoner,
    pathfinderNominal: Nominal,
    socNominal: Nominal,
    user: User,
    staffRoles: string[] = [],
  ): HmppsAction[] {
    const actions: HmppsAction[] = []
    if (canViewCalculateReleaseDates(user)) {
      actions.push({
        text: 'Calculate release dates',
        icon: Icon.CalculateReleaseDates,
        url: `${config.serviceUrls.calculateReleaseDates}/?prisonId=${prisonerData.prisonerNumber}`,
        dataQA: 'calculate-release-dates-action-link',
      })
    }
    if (canAddCaseNotes(user, prisonerData)) {
      actions.push({
        text: 'Add case note',
        icon: Icon.AddCaseNote,
        url: `/prisoner/${prisonerData.prisonerNumber}/add-case-note`,
        dataQA: 'add-case-note-action-link',
      })
    }
    if (staffRoles.includes('KW')) {
      actions.push({
        text: 'Add key worker session',
        icon: Icon.AddKeyWorkerSession,
        url: `/prisoner/${prisonerData.prisonerNumber}/add-case-note?type=KA&subType=KS`,
        dataQA: 'add-key-worker-session-action-link',
      })
    }
    if (userCanEdit(user, prisonerData) && !prisonerData.restrictedPatient) {
      actions.push({
        text: 'Add appointment',
        icon: Icon.AddAppointment,
        url: `${config.serviceUrls.digitalPrison}/offenders/${prisonerData.prisonerNumber}/add-appointment`,
        dataQA: 'add-appointment-action-link',
      })
    }
    if (userCanEdit(user, prisonerData) && !prisonerData.restrictedPatient) {
      actions.push({
        text: 'Report use of force',
        icon: Icon.ReportUseOfForce,
        url: `${config.serviceUrls.useOfForce}/report/${prisonerData.bookingId}/report-use-of-force`,
        dataQA: 'report-use-of-force-action-link',
      })
    }
    if (
      userHasRoles([Role.ActivityHub], user.userRoles) &&
      config.activitiesEnabledPrisons.includes(user.activeCaseLoadId) &&
      user.activeCaseLoadId === prisonerData.prisonId &&
      prisonerData.status !== 'ACTIVE OUT'
    ) {
      actions.push({
        text: 'Log an activity application',
        icon: Icon.LogActivityApplication,
        url: `${config.serviceUrls.activities}/waitlist/${prisonerData.prisonerNumber}/apply`,
        dataQA: 'log-an-activity-application-link',
      })
    }
    if (
      userHasRoles(
        [Role.PathfinderApproval, Role.PathfinderStdPrison, Role.PathfinderStdProbation, Role.PathfinderHQ],
        user.userRoles,
      ) &&
      !pathfinderNominal
    ) {
      actions.push({
        text: 'Refer to Pathfinder',
        icon: Icon.ReferToPathfinder,
        url: `${config.serviceUrls.pathfinder}/refer/offender/${prisonerData.prisonerNumber}`,
        dataQA: 'refer-to-pathfinder-action-link',
      })
    }
    if (userHasRoles([Role.SocCustody, Role.SocCommunity], user.userRoles) && !socNominal) {
      actions.push({
        text: 'Add to SOC',
        icon: Icon.AddToSOC,
        url: `${config.serviceUrls.manageSocCases}/refer/offender/${prisonerData.prisonerNumber}`,
        dataQA: 'add-to-soc-action-link',
      })
    }
    if (
      userHasRoles(
        [
          Role.CreateCategorisation,
          Role.ApproveCategorisation,
          Role.CreateRecategorisation,
          Role.CategorisationSecurity,
        ],
        user.userRoles,
      )
    ) {
      actions.push({
        text: 'Manage category',
        icon: Icon.ManageCategory,
        url: `${config.serviceUrls.offenderCategorisation}/${prisonerData.bookingId}`,
        dataQA: 'manage-category-action-link',
      })
    }

    return actions
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
