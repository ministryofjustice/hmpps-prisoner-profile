Cypress.Commands.add('signIn', (options = { failOnStatusCode: true, redirectPath: '/' }) => {
  const { failOnStatusCode, redirectPath } = options
  cy.request(redirectPath)
  return cy.task('getSignInUrl').then((url: string) => cy.visit(url, { failOnStatusCode }))
})

Cypress.Commands.add('setupBannerStubs', ({ prisonerNumber }) => {
  cy.task('stubPrisonerData', prisonerNumber)
  cy.task('stubEventsForProfileImage', prisonerNumber)
})

Cypress.Commands.add('setupOverviewPageStubs', ({ bookingId, prisonerNumber }) => {
  cy.task('stubNonAssociations', prisonerNumber)
  cy.task('stubPrisonerData', prisonerNumber)
  cy.task('stubAccountBalances', bookingId)
  cy.task('stubAdjudications', bookingId)
  cy.task('stubVisitSummary', bookingId)
  cy.task('stubVisitBalances', prisonerNumber)
  cy.task('stubAssessments', bookingId)
  cy.task('stubEventsForToday', bookingId)
  cy.task('stubPomData', prisonerNumber)
  cy.task('stubKeyWorkerData', prisonerNumber)
  cy.task('stubKeyWorkerSessions', { type: 'KA', subType: 'KS', numMonths: 38, bookingId })
  cy.task('stubGetOffenderContacts', bookingId)
  cy.task('stubEventsForProfileImage', prisonerNumber)
})
