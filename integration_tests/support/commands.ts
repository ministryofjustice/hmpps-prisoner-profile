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
  cy.task('stubGetCaseNoteCount', bookingId)
  cy.task('stubGetReviews', bookingId)
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

Cypress.Commands.add('setupAlertsPageStubs', ({ bookingId, prisonerNumber }) => {
  cy.task('stubEventsForProfileImage', prisonerNumber)
  cy.task('stubPrisonerData', prisonerNumber)
  cy.task('stubActiveAlerts', bookingId)
  cy.task('stubActiveAlertsPage2', bookingId)
  cy.task('stubActiveAlertsSorted', bookingId)
  cy.task('stubActiveAlertsFiltered', bookingId)
  cy.task('stubInactiveAlerts', bookingId)
  cy.task('stubInmateDetail', bookingId)
})

Cypress.Commands.add('setupWorkAndSkillsPageStubs', ({ prisonerNumber }) => {
  cy.task('stubGetLearnerEmployabilitySkills', prisonerNumber)
  cy.task('stubGetLearnerEducation', prisonerNumber)
  cy.task('stubGetLearnerProfile', prisonerNumber)
  cy.task('stubGetLearnerLatestAssessments', prisonerNumber)
  cy.task('stubGetLearnerGoals', prisonerNumber)
  cy.task('stubGetLearnerNeurodivergence', prisonerNumber)
  cy.task('stubGetOffenderAttendanceHistory', prisonerNumber)
  cy.task('stubGetOffenderActivities', prisonerNumber)
})

Cypress.Commands.add('getDataQa', id => {
  return cy.get(`[data-qa=${id}]`)
})

Cypress.Commands.add('findDataQa', { prevSubject: true }, (subject, id) => {
  return subject.find(`[data-qa=${id}]`)
})

Cypress.Commands.add('setupOffencesPageStubs', ({ prisonerNumber, bookingId }) => {
  cy.task('stubGetCourtCases', bookingId)
  cy.task('stubGetOffenceHistory', prisonerNumber)
  cy.task('stubGetSentenceTerms', bookingId)
  cy.task('stubGetPrisonerSentenceDetails', prisonerNumber)
})
