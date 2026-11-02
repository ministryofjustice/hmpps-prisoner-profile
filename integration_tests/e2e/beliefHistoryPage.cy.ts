import Page from '../pages/page'
import BeliefHistoryPage from '../pages/beliefHistoryPage'
import { mockPersonRecordWithReligionHistory } from '../../server/data/localMockData/personApi/personRecordMock'

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
    cy.task('stubPersonApiGetRecord', { prisonerNumber, withReligionHistory: true })

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
    cy.task('stubPersonApiGetRecord', {
      prisonerNumber,
      personRecord: {
        ...mockPersonRecordWithReligionHistory,
        religionHistory: [
          { ...mockPersonRecordWithReligionHistory.religionHistory[0], comments: null },
          { ...mockPersonRecordWithReligionHistory.religionHistory[0], current: false, comments: undefined },
          { ...mockPersonRecordWithReligionHistory.religionHistory[0], current: false, comments: '' },
        ],
      },
      withReligionHistory: true,
    })

    beliefHistoryPage = visitBeliefHistoryPage()
    beliefHistoryPage.getBeliefCard(0).comments.should('not.exist')
    beliefHistoryPage.getBeliefCard(1).comments.should('not.exist')
    beliefHistoryPage.getBeliefCard(2).comments.should('not.exist')
  })

  it('should display belief history comment even if change reason is false', () => {
    cy.task('stubPersonApiGetRecord', {
      prisonerNumber,
      personRecord: {
        ...mockPersonRecordWithReligionHistory,
        religionHistory: [
          { ...mockPersonRecordWithReligionHistory.religionHistory[0], changeReason: false, comments: 'Comments' },
        ],
      },
      withReligionHistory: true,
    })

    beliefHistoryPage = visitBeliefHistoryPage()
    beliefHistoryPage.getBeliefCard(0).comments.contains('Comments')
  })
})
