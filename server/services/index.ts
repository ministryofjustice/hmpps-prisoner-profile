import { dataAccess } from '../data'
import CommonApiRoutes from '../routes/common/api'
import ActivePunishmentsService from './activePunishmentsService'
import AlertsPageService from './alertsPageService'
import CaseNotesService from './caseNotesService'
import OffencesPageService from './offencesPageService'
import OffenderService from './offenderService'
import OverviewPageService from './overviewPageService'
import PersonalPageService from './personalPageService'
import PrisonerSearchService from './prisonerSearch'
import UserService from './userService'
import WorkAndSkillsPageService from './workAndSkillsPageService'
import ReferenceDataService from './referenceDataService'
import ComponentService from './componentService'
import MoneyService from './moneyService'

export const services = () => {
  const {
    hmppsAuthClientBuilder,
    prisonApiClientBuilder,
    caseNotesApiClientBuilder,
    prisonerSearchApiClientBuilder,
    allocationManagerApiClientBuilder,
    keyworkerApiClientBuilder,
    incentivesApiClientBuilder,
    curiousApiClientBuilder,
    adjudicationsApiClientBuilder,
    nonAssociationsApiClientBuilder,
    componentApiClientBuilder,
  } = dataAccess

  const userService = new UserService(hmppsAuthClientBuilder, prisonApiClientBuilder)
  const offenderService = new OffenderService(prisonApiClientBuilder)
  const commonApiRoutes = new CommonApiRoutes(offenderService)
  const caseNotesService = new CaseNotesService(caseNotesApiClientBuilder)
  const prisonerSearchService = new PrisonerSearchService(prisonerSearchApiClientBuilder)
  const alertsPageService = new AlertsPageService(prisonApiClientBuilder)
  const offencesPageService = new OffencesPageService(prisonApiClientBuilder)
  const overviewPageService = new OverviewPageService(
    prisonApiClientBuilder,
    allocationManagerApiClientBuilder,
    keyworkerApiClientBuilder,
    incentivesApiClientBuilder,
    adjudicationsApiClientBuilder,
    offencesPageService,
    curiousApiClientBuilder,
    nonAssociationsApiClientBuilder,
  )
  const personalPageService = new PersonalPageService(prisonApiClientBuilder, curiousApiClientBuilder)
  const workAndSkillsPageService = new WorkAndSkillsPageService(curiousApiClientBuilder, prisonApiClientBuilder)
  const activePunishmentsPageService = new ActivePunishmentsService(adjudicationsApiClientBuilder)
  const referenceDataService = new ReferenceDataService(prisonApiClientBuilder)
  const componentService = new ComponentService(componentApiClientBuilder)
  const moneyService = new MoneyService(prisonApiClientBuilder)

  return {
    dataAccess,
    commonApiRoutes,
    offenderService,
    userService,
    caseNotesService,
    prisonerSearchService,
    alertsPageService,
    overviewPageService,
    personalPageService,
    workAndSkillsPageService,
    activePunishmentsPageService,
    offencesPageService,
    referenceDataService,
    componentService,
    moneyService,
  }
}

export type Services = ReturnType<typeof services>

export { UserService, PrisonerSearchService, CommonApiRoutes }
