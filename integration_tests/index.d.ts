import { CaseLoad } from '../server/interfaces/caseLoad'
import { Prisoner } from '../server/interfaces/prisoner'

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
      }): Chainable<AUTWindow>
      setupOverviewPageStubs(options: {
        prisonerNumber: string
        bookingId: string
        restrictedPatient?: boolean
        prisonerDataOverrides?: Partial<Prisoner>
      }): Chainable<AUTWindow>
      setupAlertsPageStubs(options: { prisonerNumber: string; bookingId: number }): Chainable<AUTWindow>
      setupWorkAndSkillsPageStubs(options: { prisonerNumber: string; emptyStates: boolean }): Chainable<AUTWindow>
      setupOffencesPageSentencedStubs(options: { prisonerNumber: string; bookingId: number }): Chainable<AUTWindow>
      setupOffencesPageUnsentencedStubs(options: { prisonerNumber: string; bookingId: number }): Chainable<AUTWindow>
      setupUserAuth(options?: {
        roles?: string[]
        caseLoads?: CaseLoad[]
        activeCaseLoadId?: string
      }): Chainable<AUTWindow>
      getDataQa(id: string): Chainable<JQuery<HTMLElement>>
      findDataQa(id: string): Chainable<JQuery<HTMLElement>>
    }
  }
}
