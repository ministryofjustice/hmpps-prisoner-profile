import IndexPage from '../pages/index'
import AuthSignInPage from '../pages/authSignIn'
import Page from '../pages/page'
import DPSHomePage from '../pages/dpsHomePage'
import AuthErrorPage from '../pages/autherror'

context('SignIn', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubDpsHomePage')
    cy.setupUserAuth()
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

  it('User with prison role has access', () => {
    cy.setupUserAuth({ roles: ['ROLE_PRISON'] })

    cy.signIn()
    cy.visit('/prisoner/G6123VU')
    Page.verifyOnPage(IndexPage)
  })

  it('User with only global search role denied access', () => {
    cy.setupUserAuth({ roles: ['ROLE_GLOBAL_SEARCH'] })
    cy.signIn({ failOnStatusCode: false, redirectPath: '/prisoner/G6123VU' })
    Page.verifyOnPage(AuthErrorPage)
  })

  it('User without prison role denied access', () => {
    cy.setupUserAuth({ roles: ['ROLE_SOMETHING_ELSE'] })
    cy.signIn({ failOnStatusCode: false, redirectPath: '/prisoner/G6123VU' })
    Page.verifyOnPage(AuthErrorPage)
  })

  it('User can log out', () => {
    cy.setupUserAuth({ roles: ['ROLE_PRISON'] })
    cy.signIn()
    cy.visit('/prisoner/G6123VU')
    Page.verifyOnPage(IndexPage)
    cy.visit('/sign-out')
    Page.verifyOnPage(AuthSignInPage)
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
    Page.verifyOnPage(IndexPage)

    cy.task('stubVerifyToken', false)

    // can't do a visit here as cypress requires only one domain
    cy.request('/prisoner/G6123VU').its('body').should('contain', 'Sign in')

    cy.task('stubVerifyToken', true)
    cy.setupUserAuth({ name: 'bobby brown', roles: ['ROLE_PRISON'] })
    cy.signIn()

    Page.verifyOnPage(IndexPage)
  })

  it('Root URL redirects to DPS home page', () => {
    cy.signIn()
    cy.visit('/')
    Page.verifyOnPage(DPSHomePage)
  })
})
