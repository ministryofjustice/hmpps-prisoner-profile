import PrisonerPhotoPage from '../pages/photoPage'

context('Photo Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubDpsOverviewPage')
    cy.task('stubPrisonerData', 'G6123VU')
    cy.task('stubAccountBalances', '1102484')
    cy.task('stubAdjudications', '1102484')
    cy.task('stubVisitSummary', '1102484')
    cy.task('stubVisitBalances', 'G6123VU')
    cy.task('stubAssessments', '1102484')
    cy.task('stubEventsForToday', '1102484')
    cy.task('stubPomData', 'G6123VU')
    cy.task('stubKeyWorkerData', 'G6123VU')
    cy.task('stubKeyWorkerSessions', { type: 'KA', subType: 'KS', numMonths: 38, bookingId: '1102484' })
    cy.task('stubGetOffenderContacts', '1102484')
    cy.task('stubEventsForProfileImage', 'G6123VU')
  })

  it('Display the photopage', () => {
    cy.signIn()
    cy.visit('/prisoner/G6123VU/image')
    const photoPage = new PrisonerPhotoPage()
    photoPage.breadcrumbToOverview().should('exist')
  })

  it('Click the breadcrumb and go to the overview page', () => {
    cy.signIn()
    cy.visit('/prisoner/G6123VU/image')
    cy.url().should('eq', 'http://localhost:3007/prisoner/G6123VU/image')
    const photoPage = new PrisonerPhotoPage()
    photoPage.breadcrumbToOverview().should('exist')
    photoPage.breadcrumbToOverview().click()
    cy.url().should('eq', 'http://localhost:3007/prisoner/G6123VU')
  })
})
