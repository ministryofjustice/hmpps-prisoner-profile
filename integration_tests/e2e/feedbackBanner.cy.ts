import Page from '../pages/page'
import OverviewPage from '../pages/overviewPage'

const visitOverviewPage = (): OverviewPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU' })
  return Page.verifyOnPage(OverviewPage)
}

context('Feedback banner', () => {
  context.skip('Given the active caseload matches a feedback enabled prison', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        activeCaseLoadId: 'LEI',
      })
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
    })

    it('Displays the feedback banner', () => {
      visitOverviewPage()
      cy.getDataQa('feedback-banner').should('exist')
    })
  })

  context('Given the active caseload matches a feedback enabled prison', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        activeCaseLoadId: 'ZZZ',
      })
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
    })

    it('Does not display the feedback banner', () => {
      visitOverviewPage()
      cy.getDataQa('feedback-banner').should('not.exist')
    })
  })
})
