import Page from '../pages/page'
import XrayBodyScans from '../pages/xrayBodyScans'
import { permissionsTests } from './permissionsTests'

const prisonerNumber = 'G6123VU'
const bookingId = 1102484
const prisonerName = 'John Middle Names Saunders'

context('X-ray body scans - Permissions', () => {
  const visitPage = prisonerDataOverrides => {
    cy.setupBannerStubs({ prisonerNumber, prisonerDataOverrides })
    cy.task('stubXrayCareNeeds', { bookingId, numberOfXrays: 10 })
    cy.signIn({ redirectPath: `prisoner/${prisonerNumber}/x-ray-body-scans` })
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
    const xrayPage = Page.verifyOnPageWithTitle(XrayBodyScans, prisonerName)
  })
})
