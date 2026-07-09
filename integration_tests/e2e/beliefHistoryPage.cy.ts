import Page from '../pages/page'
import BeliefHistoryPage from '../pages/beliefHistoryPage'
import { beliefHistoryMock } from '../../server/data/localMockData/beliefHistoryMock'

const visitBeliefHistoryPage = (): BeliefHistoryPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/religion-belief-history' })
  return Page.verifyOnPageWithTitle(BeliefHistoryPage, 'John Saunders’ religion, faith or belief history')
}

context('Belief history page', () => {
  let beliefHistoryPage: BeliefHistoryPage

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupComponentsData()
    cy.task('stubPrisonerData', { prisonerNumber: 'G6123VU' })
  })

  it('should contain a list of beliefs', () => {
    cy.task('stubBeliefHistory', { bookingId: 1102484 })

    beliefHistoryPage = visitBeliefHistoryPage()
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

  it('should not display belief history comment if it is not present', () => {
    cy.task('stubBeliefHistory', {
      beliefHistory: [
        { ...beliefHistoryMock[0], comments: null },
        { ...beliefHistoryMock[0], comments: undefined },
        { ...beliefHistoryMock[0], comments: '' },
      ],
    })

    visitBeliefHistoryPage()

    cy.get('.belief-card').eq(0).find('.belief-card__comments').should('not.exist')
    cy.get('.belief-card').eq(1).find('.belief-card__comments').should('not.exist')
    cy.get('.belief-card').eq(2).find('.belief-card__comments').should('not.exist')
  })

  it('should display belief history comment even if change reason is false', () => {
    cy.task('stubBeliefHistory', {
      beliefHistory: [{ ...beliefHistoryMock[0], changeReason: false, comments: 'Comments' }],
    })

    beliefHistoryPage = visitBeliefHistoryPage()
    beliefHistoryPage.activeBeliefCard().comments().contains('Comments')
  })
})
