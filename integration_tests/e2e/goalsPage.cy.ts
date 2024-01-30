import Page from '../pages/page'
import GoalsPage from '../pages/goalsPage'

const visitGoalsPage = () => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/goals' })
}

context('Prisoners goals page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.task('stubPrisonerData', { prisonerNumber: 'G6123VU' })
  })

  it('should contain a banner about learning and work progress service replacing VC2', () => {
    // Given
    cy.setupWorkAndSkillsPageStubs({ prisonerNumber: 'G6123VU', emptyStates: false })
    visitGoalsPage()

    // When
    const goalsPage = Page.verifyOnPageWithTitle(GoalsPage, 'John Saunders’ goals in Virtual Campus (VC2)')

    // Check
    goalsPage.banner().contains('The learning and work progress service in DPS is replacing VC2')
  })

  it('should display goals', () => {
    // Given
    cy.setupWorkAndSkillsPageStubs({ prisonerNumber: 'G6123VU', emptyStates: false })
    visitGoalsPage()

    // When
    const goalsPage = Page.verifyOnPageWithTitle(GoalsPage, 'John Saunders’ goals in Virtual Campus (VC2)')

    // Check
    goalsPage.employmentGoalsList().should('exist')
    goalsPage.personalGoalsList().should('exist')
    goalsPage.shortTermGoalsList().should('exist')
    goalsPage.longTermGoalsList().should('exist')
  })

  it('should display no goals message given there are no goals', () => {
    // Given
    cy.setupWorkAndSkillsPageStubs({ prisonerNumber: 'G6123VU', emptyStates: true })
    visitGoalsPage()

    // When
    const goalsPage = Page.verifyOnPageWithTitle(GoalsPage, 'John Saunders’ goals in Virtual Campus (VC2)')

    // Check
    goalsPage.noEmploymentGoalsMessage().should('exist')
    goalsPage.noPersonalGoalsMessage().should('exist')
    goalsPage.noShortTermGoalsMessage().should('exist')
    goalsPage.noLongTermGoalsMessage().should('exist')
  })
})
