import Page from '../pages/page'
import XrayBodyScans from '../pages/xrayBodyScans'
import { permissionsTests } from './permissionsTests'
import NotFoundPage from '../pages/notFoundPage'

const prisonerNumber = 'G6123VU'
const bookingId = 1102484
const prisonerName = 'John Saunders'

context('X-ray body scans - Permissions', () => {
  const visitPage = prisonerDataOverrides => {
    cy.setupBannerStubs({ prisonerNumber, prisonerDataOverrides })
    cy.task('stubXrayCareNeeds', { bookingId, numberOfXrays: 10 })
    cy.signIn({ failOnStatusCode: false, redirectPath: `prisoner/${prisonerNumber}/x-ray-body-scans` })
  }

  permissionsTests({
    prisonerNumber,
    visitPage,
    pageWithTitleToDisplay: { page: XrayBodyScans, title: prisonerName },
  })
})

context('X-Ray body scans', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupBannerStubs({ prisonerNumber })
    cy.task('stubXrayCareNeeds', { bookingId, numberOfXrays: 10 })
  })

  it('Displays the page', () => {
    cy.signIn({ redirectPath: `prisoner/${prisonerNumber}/x-ray-body-scans` })
    Page.verifyOnPageWithTitle(XrayBodyScans, prisonerName)
  })

  it('Displays the body scans', () => {
    cy.signIn({ redirectPath: `prisoner/${prisonerNumber}/x-ray-body-scans` })
    const page = Page.verifyOnPageWithTitle(XrayBodyScans, prisonerName)
    page.bodyScan(1).date().should('include.text', new Date().getFullYear())
    page.bodyScan(1).comment().should('include.text', 'There was a body scan')
  })

  context('404 page', () => {
    it('Photo page should go to 404 not found page', () => {
      cy.signIn({ failOnStatusCode: false, redirectPath: `prisoner/asudhsdudhid/x-ray-body-scans` })
      Page.verifyOnPage(NotFoundPage)
    })
  })
})
