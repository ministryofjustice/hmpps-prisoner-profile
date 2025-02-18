import PrisonerPhotoPage from '../pages/photoPage'
import { permissionsTests } from './permissionsTests'
import Page from '../pages/page'
import NotFoundPage from '../pages/notFoundPage'

context('Photo Page', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484

  context('Permissions', () => {
    const visitPage = prisonerDataOverrides => {
      cy.setupBannerStubs({
        prisonerNumber,
        bookingId,
        prisonerDataOverrides: { ...prisonerDataOverrides, category: 'B' },
      })
      cy.task('stubImageDetails')
      cy.task('stubImagesForOffender', prisonerNumber)
      cy.signIn({ failOnStatusCode: false, redirectPath: 'prisoner/G6123VU/image' })
    }
    permissionsTests({ prisonerNumber, visitPage, pageToDisplay: PrisonerPhotoPage })
  })

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupComponentsData()
    cy.setupBannerStubs({ prisonerNumber, bookingId })
    cy.setupOverviewPageStubs({ prisonerNumber, bookingId, prisonerDataOverrides: { category: 'B' } })
    cy.task('stubImageDetails')
    cy.task('stubImagesForOffender', prisonerNumber)
  })

  it('Display the photopage', () => {
    cy.signIn({ redirectPath: 'prisoner/G6123VU/image' })
    const photoPage = new PrisonerPhotoPage()
    photoPage.breadcrumbToOverview().should('exist')
  })

  it('Click the breadcrumb and go to the overview page', () => {
    cy.signIn({ redirectPath: 'prisoner/G6123VU/image' })
    cy.url().should('eq', 'http://localhost:3007/prisoner/G6123VU/image')
    const photoPage = new PrisonerPhotoPage()
    photoPage.breadcrumbToOverview().should('exist')
    photoPage.breadcrumbToOverview().click()
    cy.url().should('eq', 'http://localhost:3007/prisoner/G6123VU')
  })

  it('Clicking the print link should open a print dialog', () => {
    cy.signIn({ redirectPath: 'prisoner/G6123VU/image' })
    cy.url().should('eq', 'http://localhost:3007/prisoner/G6123VU/image')
    cy.window().then(win => {
      cy.stub(win, 'print').as('Print')
    })
    const photoPage = new PrisonerPhotoPage()
    photoPage.printLink().should('be.visible')
    photoPage.printLink().click()
    cy.get('@Print').should('have.been.called')
  })

  it('Photo page should go to 404 not found page', () => {
    cy.signIn({ failOnStatusCode: false, redirectPath: 'prisoner/asudhsdudhid/image' })
    Page.verifyOnPage(NotFoundPage)
  })
})
