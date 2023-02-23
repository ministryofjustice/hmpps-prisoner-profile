import IndexPage from '../pages/index'
import AuthSignInPage from '../pages/authSignIn'
import Page from '../pages/page'
import AuthManageDetailsPage from '../pages/authManageDetails'
import DPSHomePage from '../pages/dpsHomePage'

context('SignIn', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubDpsHomePage')
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
    cy.visit('/prisoner/G6123VU')
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.headerUserName().should('contain.text', 'J. Smith')
  })

  it('User can log out', () => {
    cy.signIn()
    cy.visit('/prisoner/G6123VU')
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.signOut().click()
    Page.verifyOnPage(AuthSignInPage)
  })

  it('User can manage their details', () => {
    cy.signIn()
    cy.visit('/prisoner/G6123VU')
    const indexPage = Page.verifyOnPage(IndexPage)

    indexPage.manageDetails().get('a').invoke('removeAttr', 'target')
    indexPage.manageDetails().click({ multiple: true })
    Page.verifyOnPage(AuthManageDetailsPage)
  })

  it('Token verification failure takes user to sign in page', () => {
    cy.signIn()
    cy.visit('/prisoner/G6123VU')
    Page.verifyOnPage(IndexPage)
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/prisoner/G6123VU').its('body').should('contain', 'Sign in')
  })

  it('Token verification failure clears user session', () => {
    cy.signIn()
    cy.visit('/prisoner/G6123VU')
    const indexPage = Page.verifyOnPage(IndexPage)
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/prisoner/G6123VU').its('body').should('contain', 'Sign in')

    cy.task('stubVerifyToken', true)
    cy.task('stubAuthUser', 'bobby brown')
    cy.signIn()

    indexPage.headerUserName().contains('B. Brown')
  })

  it('Root URL redirects to DPS home page', () => {
    cy.signIn()
    cy.visit('/')
    Page.verifyOnPage(DPSHomePage)
  })
})
