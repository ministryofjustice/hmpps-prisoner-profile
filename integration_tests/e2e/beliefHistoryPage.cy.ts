import Page from '../pages/page'
import BeliefHistoryPage from '../pages/beliefHistoryPage'
import { mockReligionHistory } from '../../server/data/localMockData/personApi/religionMocks'

const prisonerNumber = 'G6123VU'
const visitBeliefHistoryPage = (): BeliefHistoryPage => {
  cy.signIn({ redirectPath: `/prisoner/${prisonerNumber}/religion-belief-history` })
  return Page.verifyOnPageWithTitle(BeliefHistoryPage, 'John Saunders’ religion, faith or belief history')
}

context('Belief history page', () => {
  let beliefHistoryPage: BeliefHistoryPage

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupComponentsData()
    cy.task('stubPrisonerData', { prisonerNumber })
    cy.task('stubManageUsersGetPrisonUser', { user: { username: 'jlpic', firstName: 'Jean-Luc', lastName: 'Picard' } })
  })

  it('should contain a list of beliefs', () => {
    cy.task('stubPersonApiGetReligionHistory', { prisonerNumber, response: mockReligionHistory })

    beliefHistoryPage = visitBeliefHistoryPage()
    beliefHistoryPage.beliefHistoryList.should('have.length', 2)

    const activeBelief = beliefHistoryPage.getBeliefCard(0)
    activeBelief.description.contains('They prefer not to say')
    activeBelief.activeTag.contains('ACTIVE')
    activeBelief.comments.contains('They do not want others to know')
    activeBelief.startDate.contains('28 October 2026')
    activeBelief.endDate.should('not.exist')
    activeBelief.created.contains('Jean-Luc Picard')
    activeBelief.modified.should('not.exist')

    const previousBelief = beliefHistoryPage.getBeliefCard(1)
    previousBelief.description.contains('Celestial Church of God')
    previousBelief.activeTag.should('not.exist')
    previousBelief.comments.should('not.exist')
    previousBelief.startDate.contains('1 January 2022')
    previousBelief.endDate.contains('28 October 2026')
    previousBelief.created.contains('Jkirk')
    previousBelief.modified.contains('Jean-Luc Picard on 28 October 2026')
  })

  it('should not display belief history comment if it is not present', () => {
    cy.task('stubPersonApiGetReligionHistory', {
      prisonerNumber,
      response: [
        { ...mockReligionHistory[0], comments: null },
        { ...mockReligionHistory[0], current: false, comments: undefined },
        { ...mockReligionHistory[0], current: false, comments: '' },
      ],
    })

    beliefHistoryPage = visitBeliefHistoryPage()
    beliefHistoryPage.getBeliefCard(0).comments.should('not.exist')
    beliefHistoryPage.getBeliefCard(1).comments.should('not.exist')
    beliefHistoryPage.getBeliefCard(2).comments.should('not.exist')
  })

  it('should display belief history comment even if change reason is false', () => {
    cy.task('stubPersonApiGetReligionHistory', {
      prisonerNumber,
      response: [{ ...mockReligionHistory[0], changeReason: false, comments: 'Comments' }],
    })

    beliefHistoryPage = visitBeliefHistoryPage()
    beliefHistoryPage.getBeliefCard(0).comments.contains('Comments')
  })

  it('should state when there is no history', () => {
    cy.task('stubPersonApiGetReligionHistory', {
      prisonerNumber,
      response: [],
    })

    visitBeliefHistoryPage()
    cy.get('main').should('contain.text', 'John Saunders has no religion history')
  })
})
