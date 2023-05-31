import { Request, Response } from 'express'
import { mapHeaderData } from '../mappers/headerMappers'
import { PrisonerSearchService } from '../services'
import PrisonApiRestClient from '../data/prisonApiClient'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import AllocationManagerClient from '../data/allocationManagerApiClient'
import KeyWorkersClient from '../data/keyWorkersApiClient'
import IncentivesApiRestClient from '../data/incentivesApiClient'
import OverviewPageService from '../services/overviewPageService'
import { canAddCaseNotes, canViewCaseNotes } from '../utils/roleHelpers'
import { Prisoner } from '../interfaces/prisoner'
import { HmppsAction } from '../interfaces/hmppsAction'
import { Icon } from '../data/enums/icon'
import config from '../config'
import { User } from '../data/hmppsAuthClient'
import { prisonerBelongsToUsersCaseLoad, userCanEdit, userHasRoles } from '../utils/utils'
import { Role } from '../data/enums/role'
import PathfinderApiRestClient from '../data/pathfinderApiClient'
import { Nominal } from '../interfaces/pathfinderApi/nominal'
import ManageSocCasesApiRestClient from '../data/manageSocCasesApiClient'
import { IncentivesApiClient } from '../data/interfaces/incentivesApiClient'
import { PathfinderApiClient } from '../data/interfaces/pathfinderApiClient'
import { ManageSocCasesApiClient } from '../data/interfaces/manageSocCasesApiClient'

/**
 * Parse request for overview page and orchestrate response
 */
export default class OverviewController {
  private prisonerSearchService: PrisonerSearchService

  private prisonApiClient: PrisonApiClient

  private allocationManagerClient: AllocationManagerClient

  private keyWorkersClient: KeyWorkersClient

  private incentivesApiClient: IncentivesApiClient

  private pathfinderApiClient: PathfinderApiClient

  private manageSocCasesApiClient: ManageSocCasesApiClient

  constructor(clientToken: string) {
    this.prisonerSearchService = new PrisonerSearchService(clientToken)
    this.prisonApiClient = new PrisonApiRestClient(clientToken)
    this.allocationManagerClient = new AllocationManagerClient(clientToken)
    this.keyWorkersClient = new KeyWorkersClient(clientToken)
    this.incentivesApiClient = new IncentivesApiRestClient(clientToken)
    this.pathfinderApiClient = new PathfinderApiRestClient(clientToken)
    this.manageSocCasesApiClient = new ManageSocCasesApiRestClient(clientToken)
  }

  public async displayOverview(req: Request, res: Response) {
    const overviewPageService = new OverviewPageService(
      this.prisonApiClient,
      this.allocationManagerClient,
      this.keyWorkersClient,
      this.incentivesApiClient,
    )

    // Get prisoner data for banner and for use in alerts generation
    const prisonerData = await this.prisonerSearchService.getPrisonerDetails(req.params.prisonerNumber)

    const [overviewPageData, pathfinderNominal, socNominal] = await Promise.all([
      overviewPageService.get(prisonerData, res.locals.user.userRoles),
      this.pathfinderApiClient.getNominal(prisonerData.prisonerNumber),
      this.manageSocCasesApiClient.getNominal(prisonerData.prisonerNumber),
    ])

    const overviewActions = this.buildOverviewActions(prisonerData, pathfinderNominal, socNominal, res.locals.user)

    const overviewInfoLinks = this.buildOverviewInfoLinks(prisonerData, pathfinderNominal, socNominal, res.locals.user)

    // Set role based permissions
    const canView = canViewCaseNotes(res.locals.user, prisonerData)
    const canAdd = canAddCaseNotes(res.locals.user, prisonerData)

    res.render('pages/overviewPage', {
      pageTitle: 'Overview',
      ...mapHeaderData(prisonerData, res.locals.user, 'overview'),
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
  ): HmppsAction[] {
    const actions: HmppsAction[] = []
    if (canAddCaseNotes(user, prisonerData)) {
      actions.push({
        text: 'Add case note',
        icon: Icon.AddCaseNote,
        url: `${config.serviceUrls.digitalPrison}/prisoner/${prisonerData.prisonerNumber}/add-case-note`,
        dataQA: 'add-case-note-action-link',
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
