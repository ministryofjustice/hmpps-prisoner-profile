import Page from '../pages/page'
import GoalsPage from '../pages/goalsPage'

const visitGoalsPage = (): GoalsPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/goals' })
  return Page.verifyOnPageWithTitle(GoalsPage, 'Michael Willis’ goals in Virtual Campus (VC2)')
}

context('Prisoners goals page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.task('stubPrisonerData', { prisonerNumber: 'G6123VU' })
  })

  context('Goals page', () => {
    let goalsPage: GoalsPage

    beforeEach(() => {
      goalsPage = visitGoalsPage()
    })

    it('should contain a banner about learning and work progress service replacing VC2', () => {
      goalsPage.banner().contains('The learning and work progress service in DPS is replacing VC2')
    })

    it('should display goals', () => {
      goalsPage.employmentGoalsList().should('exist')
      goalsPage.personalGoalsList().should('exist')
      goalsPage.shortTermGoalsList().should('exist')
      goalsPage.longTermGoalsList().should('exist')
    })
  })
})
