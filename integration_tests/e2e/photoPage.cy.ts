import PrisonerPhotoPage from '../pages/photoPage'

context('Photo Page', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = '1102484'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
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
