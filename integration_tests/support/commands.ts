Cypress.Commands.add('signIn', (options = { failOnStatusCode: true, redirectPath: '/' }) => {
  const { failOnStatusCode, redirectPath } = options
  cy.request(redirectPath)
  return cy.task('getSignInUrl').then((url: string) => cy.visit(url, { failOnStatusCode }))
})

Cypress.Commands.add('setupBannerStubs', ({ prisonerNumber, prisonerDataOverrides }) => {
  cy.task('stubPrisonerData', { prisonerNumber, overrides: prisonerDataOverrides })
  cy.task('stubEventsForProfileImage', prisonerNumber)
})

Cypress.Commands.add(
  'setupOverviewPageStubs',
  ({ bookingId, prisonerNumber, restrictedPatient = false, prisonerDataOverrides = {}, staffRoles = [] }) => {
    cy.task('stubNonAssociations', prisonerNumber)
    cy.task('stubPrisonerData', { prisonerNumber, restrictedPatient, overrides: prisonerDataOverrides })
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
    cy.task('stubGetMainOffence', bookingId)
    cy.task('stubGetFullStatus', prisonerNumber)
    cy.task('stubGetCourtCases', bookingId)
    cy.task('stubGetPathfinderNominal')
    cy.task('stubGetPathfinderNominal404')
    cy.task('stubGetSocNominal')
    cy.task('stubGetSocNominal404')
    cy.task('stubGetStaffRoles', staffRoles)
  },
)

Cypress.Commands.add('setupAlertsPageStubs', ({ bookingId, prisonerNumber, prisonerDataOverrides = {} }) => {
  cy.task('stubEventsForProfileImage', prisonerNumber)
  cy.task('stubPrisonerData', { prisonerNumber, overrides: prisonerDataOverrides })
  cy.task('stubActiveAlerts', bookingId)
  cy.task('stubActiveAlertsPage2', bookingId)
  cy.task('stubActiveAlertsSorted', bookingId)
  cy.task('stubActiveAlertsFiltered', bookingId)
  cy.task('stubInactiveAlerts', bookingId)
  cy.task('stubInmateDetail', bookingId)
})

Cypress.Commands.add('setupWorkAndSkillsPageStubs', ({ prisonerNumber, emptyStates }) => {
  cy.task('stubGetLearnerEmployabilitySkills', prisonerNumber)
  cy.task('stubGetLearnerEducation', prisonerNumber)
  cy.task('stubGetLearnerProfile', prisonerNumber)
  cy.task('stubGetLearnerLatestAssessments', prisonerNumber)
  cy.task('stubGetLearnerGoals', { prisonerNumber, emptyStates })
  cy.task('stubGetLearnerNeurodivergence', prisonerNumber)
  cy.task('stubGetOffenderAttendanceHistory', prisonerNumber)
  cy.task('stubGetOffenderActivities', { prisonerNumber, emptyStates })
})

Cypress.Commands.add('getDataQa', id => {
  return cy.get(`[data-qa=${id}]`)
})

Cypress.Commands.add('findDataQa', { prevSubject: true }, (subject, id) => {
  return subject.find(`[data-qa=${id}]`)
})

Cypress.Commands.add('setupOffencesPageSentencedStubs', ({ prisonerNumber, bookingId }) => {
  cy.task('stubGetCourtCasesSentenced', bookingId)
  cy.task('stubGetOffenceHistory', prisonerNumber)
  cy.task('stubGetSentenceTermsSentenced', bookingId)
  cy.task('stubGetPrisonerSentenceDetails', prisonerNumber)
  cy.task('stubGetCourtDateResultsSentenced', prisonerNumber)
  cy.task('stubGetSentenceSummaryWithSentence', prisonerNumber)
})

Cypress.Commands.add('setupOffencesPageUnsentencedStubs', ({ prisonerNumber, bookingId }) => {
  cy.task('stubGetCourtCasesUnsentenced', bookingId)
  cy.task('stubGetOffenceHistory', prisonerNumber)
  cy.task('stubGetSentenceTermsUnsentenced', bookingId)
  cy.task('stubGetPrisonerSentenceDetails', prisonerNumber)
  cy.task('stubGetCourtDateResultsUnsentenced', prisonerNumber)
  cy.task('stubGetSentenceSummaryWithoutSentence', prisonerNumber)
})

Cypress.Commands.add('setupUserAuth', ({ roles, caseLoads, activeCaseLoadId = 'MDI' } = {}) => {
  cy.task('stubSignIn', roles)
  cy.task('stubUserCaseLoads', caseLoads)
  cy.task('stubAuthUser', { activeCaseLoadId })
})

Cypress.Commands.add('setupActivePunishmentsPageStubs', ({ prisonerNumber, bookingId }) => {
  cy.task('stubAdjudicationsWithActive', bookingId)
  cy.task('stubDpsAdjudicationsHistoryPage', prisonerNumber)
})
