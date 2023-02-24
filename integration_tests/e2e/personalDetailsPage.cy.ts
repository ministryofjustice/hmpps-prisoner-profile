import Page from '../pages/page'
import PersonalDetailsPage from '../pages/personalDetailsPage'

const visitPersonalDetailsPage = (): PersonalDetailsPage => {
  cy.signIn({ redirectPath: 'prisoner/G6123VU/personal' })
  return Page.verifyOnPage(PersonalDetailsPage)
}

context('When signed in', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
  })

  it('displays the personal details page', () => {
    visitPersonalDetailsPage()
    cy.request('/prisoner/G6123VU/personal').its('body').should('contain', 'Personal')
  })
})
