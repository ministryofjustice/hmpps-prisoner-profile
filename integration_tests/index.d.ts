declare namespace Cypress {
  interface Chainable {
    /**
     * Custom command to signIn. Set failOnStatusCode to false if you expect and non 200 return code
     * @example cy.signIn({ failOnStatusCode: boolean })
     */
    signIn(options?: { failOnStatusCode?: boolean; redirectPath?: string }): Chainable<AUTWindow>
    setupBannerStubs(options: { prisonerNumber: string }): Chainable<AUTWindow>
    setupOverviewPageStubs(options: { prisonerNumber: string; bookingId: string }): Chainable<AUTWindow>
    setupAlertsPageStubs(options: { prisonerNumber: string; bookingId: number }): Chainable<AUTWindow>
    setupWorkAndSkillsPageStubs(options: { prisonerNumber: string }): Chainable<AUTWindow>
    setupOffencesPageStubs(options: { prisonerNumber: string; bookingId: number }): Chainable<AUTWindow>
  }
}
