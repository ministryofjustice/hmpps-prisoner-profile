import IndexPage from '../pages/index'
import AuthSignInPage from '../pages/authSignIn'
import Page from '../pages/page'
import PrisonerPhotoPage from '../pages/photoPage'

context('Photo Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.task('stubNonAssociations', 'G6123VU')
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

  it('Unauthenticated user directed to auth', () => {
    cy.visit('/prisoner/G6123VU')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('Unauthenticated user navigating to sign in page directed to auth', () => {
    cy.visit('/sign-in')
    Page.verifyOnPage(AuthSignInPage)
  })

  it('User name visible in header', () => {
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.headerUserName().should('contain.text', 'J. Smith')
  })

  it('User can log out', () => {
    cy.signIn()
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.signOut().click()
    Page.verifyOnPage(AuthSignInPage)
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
