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
    offencesPageService,
  )
  const personalPageService = new PersonalPageService(prisonApiClientBuilder)
  const workAndSkillsPageService = new WorkAndSkillsPageService(curiousApiClientBuilder, prisonApiClientBuilder)
  const activePunishmentsPageService = new ActivePunishmentsService(prisonApiClientBuilder)

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
  }
}

export type Services = ReturnType<typeof services>

export { UserService, PrisonerSearchService, CommonApiRoutes }
