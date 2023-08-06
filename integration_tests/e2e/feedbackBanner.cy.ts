import Page from '../pages/page'
import OverviewPage from '../pages/overviewPage'

const visitOverviewPage = (): OverviewPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU' })
  return Page.verifyOnPage(OverviewPage)
}

context('Feedback banner', () => {
  context('Given the active caseload does not matche a feedback disabled prison', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        activeCaseLoadId: 'FNI',
      })
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
    })

    it('Displays the feedback banner', () => {
      visitOverviewPage()
      cy.getDataQa('feedback-banner').should('exist')
    })
  })

  context('Given the active caseload matches a feedback disabled prison', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        activeCaseLoadId: 'LEI',
      })
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
    })

    it('Does not display the feedback banner', () => {
      visitOverviewPage()
      cy.getDataQa('feedback-banner').should('not.exist')
    })
  })
})
