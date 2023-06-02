import IndexPage from '../pages/index'
import AuthSignInPage from '../pages/authSignIn'
import Page from '../pages/page'
import AuthManageDetailsPage from '../pages/authManageDetails'
import DPSHomePage from '../pages/dpsHomePage'
import AuthErrorPage from '../pages/autherror'

context('SignIn', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubDpsHomePage')
    cy.task('stubAuthUser')
    cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
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
    cy.setupUserAuth()
    cy.signIn()
    cy.visit('/prisoner/G6123VU')
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.headerUserName().should('contain.text', 'J. Smith')
  })

  it('User with prison role has access', () => {
    cy.setupUserAuth({ roles: ['ROLE_PRISON'] })

    cy.signIn()
    cy.visit('/prisoner/G6123VU')
    Page.verifyOnPage(IndexPage)
  })

  it('User with Global Search role has access', () => {
    cy.setupUserAuth({ roles: ['ROLE_GLOBAL_SEARCH'] })
    cy.signIn()
    cy.visit('/prisoner/G6123VU')
    Page.verifyOnPage(IndexPage)
  })

  it('User with neither prison or global search role denied access', () => {
    cy.setupUserAuth({ roles: ['ROLE_SOMETHING_ELSE'] })

    cy.signIn({ failOnStatusCode: false, redirectPath: '/prisoner/G6123VU' })
    Page.verifyOnPage(AuthErrorPage)
  })

  it('User can log out', () => {
    cy.setupUserAuth({ roles: ['ROLE_PRISON'] })
    cy.signIn()
    cy.visit('/prisoner/G6123VU')
    const indexPage = Page.verifyOnPage(IndexPage)
    indexPage.signOut().click()
    Page.verifyOnPage(AuthSignInPage)
  })

  it('User can manage their details', () => {
    cy.setupUserAuth({ roles: ['ROLE_PRISON'] })
    cy.signIn()
    cy.visit('/prisoner/G6123VU')
    const indexPage = Page.verifyOnPage(IndexPage)

    indexPage.manageDetails().get('a').invoke('removeAttr', 'target')
    indexPage.manageDetails().click({ multiple: true })
    Page.verifyOnPage(AuthManageDetailsPage)
  })

  it('Token verification failure takes user to sign in page', () => {
    cy.setupUserAuth({ roles: ['ROLE_PRISON'] })
    cy.signIn()
    cy.visit('/prisoner/G6123VU')
    Page.verifyOnPage(IndexPage)
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/prisoner/G6123VU').its('body').should('contain', 'Sign in')
  })

  it('Token verification failure clears user session', () => {
    cy.setupUserAuth({ roles: ['ROLE_PRISON'] })
    cy.signIn()
    cy.visit('/prisoner/G6123VU')
    const indexPage = Page.verifyOnPage(IndexPage)
    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/prisoner/G6123VU').its('body').should('contain', 'Sign in')

    cy.task('stubVerifyToken', true)
    cy.task('stubAuthUser', { name: 'bobby brown' })
    cy.signIn()

    indexPage.headerUserName().contains('B. Brown')
  })

  it('Root URL redirects to DPS home page', () => {
    cy.signIn()
    cy.visit('/')
    Page.verifyOnPage(DPSHomePage)
  })
})
