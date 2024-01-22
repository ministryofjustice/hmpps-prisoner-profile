import Page from '../pages/page'
import BeliefHistoryPage from '../pages/beliefHistoryPage'

const visitBeliefHistoryPage = (): BeliefHistoryPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/religion-belief-history' })
  return Page.verifyOnPageWithTitle(BeliefHistoryPage, 'John Saunders’ religion or belief history')
}

context('Belief history page', () => {
  let beliefHistoryPage: BeliefHistoryPage

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.task('stubPrisonerData', { prisonerNumber: 'G6123VU' })
    cy.task('stubBeliefHistory')

    beliefHistoryPage = visitBeliefHistoryPage()
  })

  it('should contain a list of beliefs', () => {
    beliefHistoryPage.beliefHistoryList().children().should('have.length', 2)

    const activeBelief = beliefHistoryPage.activeBeliefCard()
    activeBelief.description().contains('Scientologist')
    activeBelief.activeTag().should('be.visible')
    activeBelief.comments().contains('Comments')
    activeBelief.startDate().contains('1 January 2024')
    activeBelief.endDate().should('not.exist')
    activeBelief.addedBy().contains('James Kirk')
    activeBelief.updatedBy().should('not.exist')

    const previousBelief = beliefHistoryPage.previousBeliefCard()
    previousBelief.description().contains('Roman Catholic')
    previousBelief.activeTag().should('not.exist')
    previousBelief.comments().contains('Comments')
    previousBelief.startDate().contains('1 January 2024')
    previousBelief.endDate().contains('2 February 2024')
    previousBelief.addedBy().contains('James Kirk')
    previousBelief.updatedBy().contains('Jean-Luc Picard on 3 February 2024')
  })
})
