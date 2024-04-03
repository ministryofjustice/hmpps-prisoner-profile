import CaseLoad from '../server/data/interfaces/prisonApi/CaseLoad'
import StaffRole from '../server/data/interfaces/prisonApi/StaffRole'
import Prisoner from '../server/data/interfaces/prisonerSearchApi/Prisoner'
import { ComplexityLevel } from '../server/data/interfaces/complexityApi/ComplexityOfNeed'
import VisitWithVisitors from '../server/data/interfaces/prisonApi/VisitWithVisitors'

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to signIn. Set failOnStatusCode to false if you expect and non 200 return code
       * @example cy.signIn({ failOnStatusCode: boolean })
       */
      signIn(options?: { failOnStatusCode?: boolean; redirectPath?: string }): Chainable<AUTWindow>
      setupBannerStubs(options: {
        prisonerNumber: string
        prisonerDataOverrides?: Partial<Prisoner>
        bookingId?: number
      }): Chainable<AUTWindow>
      setupOverviewPageStubs(options: {
        prisonerNumber: string
        bookingId: number
        restrictedPatient?: boolean
        prisonerDataOverrides?: Partial<Prisoner>
        prisonId?: string
        staffRoles?: StaffRole[]
        complexityLevel?: ComplexityLevel
      }): Chainable<AUTWindow>
      setupAlertsPageStubs(options: {
        prisonerNumber: string
        bookingId: number
        prisonerDataOverrides?: Partial<Prisoner>
      }): Chainable<AUTWindow>
      setupPersonalPageSubs(options: {
        prisonerNumber: string
        bookingId: number
        prisonerDataOverrides?: Partial<Prisoner>
        caseLoads?: CaseLoad[]
      }): Chainable<AUTWindow>
      setupWorkAndSkillsPageStubs(options: { prisonerNumber: string; emptyStates?: boolean }): Chainable<AUTWindow>
      setupOffencesPageSentencedStubs(options: { prisonerNumber: string; bookingId: number }): Chainable<AUTWindow>
      setupOffencesPageUnsentencedStubs(options: { prisonerNumber: string; bookingId: number }): Chainable<AUTWindow>
      setupUserAuth(options?: {
        roles?: string[]
        caseLoads?: CaseLoad[]
        activeCaseLoadId?: string
      }): Chainable<AUTWindow>
      getDataQa(id: string): Chainable<JQuery<HTMLElement>>
      findDataQa(id: string): Chainable<JQuery<HTMLElement>>
      setupPrisonerSchedulePageStubs(options: { prisonerNumber: string; bookingId: number }): Chainable<AUTWindow>
      setupMoneyStubs(options: { prisonerNumber: string; bookingId: number; prisonId: string }): Chainable<AUTWindow>
      setupSpecificLocationHistoryPageStubs(options?: {
        prisonerNumber?: string
        bookingId?: number
        locationId?: string
        staffId?: string
        prisonId: string
        caseLoads: CaseLoad[]
        sharingHistory: {
          bookingId: number
          prisonerNumber: string
          movedIn: string
          movedOut: string
          firstName: string
          lastName: string
        }[]
      }): Chainable<AUTWindow>
      setupVisitsDetailsPageStubs(options: {
        prisonerNumber: string
        bookingId: number
        visitsOverrides?: VisitWithVisitors[]
      }): Chainable<AUTWindow>
    }
  }
}
