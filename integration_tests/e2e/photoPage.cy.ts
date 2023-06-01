import PrisonerPhotoPage from '../pages/photoPage'
import { permissionsTests } from './permissionsTests'

context('Photo Page', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484

  context('Permissions', () => {
    const visitPage = () => cy.signIn({ redirectPath: 'prisoner/G6123VU/image' })
    permissionsTests({ prisonerNumber, visitPage, pageToDisplay: PrisonerPhotoPage })
  })

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupBannerStubs({ prisonerNumber })
    cy.setupOverviewPageStubs({ prisonerNumber, bookingId })
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
})
