import { permissionsTests } from './permissionsTests'
import Page from '../pages/page'
import NotFoundPage from '../pages/notFoundPage'
import PrisonerPhotoListPage from '../pages/photoListPage'

context('Photo Page', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484

  context('Permissions', () => {
    const visitPage = prisonerDataOverrides => {
      cy.setupBannerStubs({ prisonerNumber, bookingId, prisonerDataOverrides })
      cy.task('stubImageDetails')
      cy.task('stubImagesForOffender', prisonerNumber)
      cy.signIn({ failOnStatusCode: false, redirectPath: 'prisoner/G6123VU/image/all' })
    }
    permissionsTests({ prisonerNumber, visitPage, pageToDisplay: PrisonerPhotoListPage })
  })

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupComponentsData()
    cy.setupBannerStubs({ prisonerNumber, bookingId })
    cy.setupOverviewPageStubs({ prisonerNumber, bookingId })
    cy.task('stubImageDetails')
    cy.task('stubImagesForOffender', prisonerNumber)
  })

  it('Displays the photo list page', () => {
    cy.signIn({ redirectPath: 'prisoner/G6123VU/image/all' })
    const photoPage = new PrisonerPhotoListPage()
    photoPage.breadcrumbToOverview().should('exist')
    photoPage.photoList().row(0).photo().should('have.attr', 'src', '/api/image/1413311')
    photoPage.photoList().row(0).details().should('include.text', 'Main facial image')
    photoPage.photoList().row(0).details().should('include.text', '11 January 2025')

    photoPage.photoList().row(1).photo().should('have.attr', 'src', '/api/image/4321')
    photoPage.photoList().row(1).details().should('include.text', '11 January 2024')
  })

  it('Click the breadcrumb and go to the overview page', () => {
    cy.signIn({ redirectPath: 'prisoner/G6123VU/image/all' })
    cy.url().should('eq', 'http://localhost:3007/prisoner/G6123VU/image/all')
    const photoPage = new PrisonerPhotoListPage()
    photoPage.breadcrumbToOverview().should('exist')
    photoPage.breadcrumbToOverview().click()
    cy.url().should('eq', 'http://localhost:3007/prisoner/G6123VU')
  })

  it('Photo page should go to 404 not found page', () => {
    cy.signIn({ failOnStatusCode: false, redirectPath: 'prisoner/asudhsdudhid/image/all' })
    Page.verifyOnPage(NotFoundPage)
  })
})
