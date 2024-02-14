import Page from '../pages/page'
import Vc2GoalsPage from '../pages/vc2GoalsPage'

const visitGoalsPage = () => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/vc2-goals' })
}

context('Prisoners VC2 goals page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.task('stubPrisonerData', { prisonerNumber: 'G6123VU' })
  })

  it('should contain a banner about learning and work progress service replacing VC2', () => {
    // Given
    cy.setupWorkAndSkillsPageStubs({ prisonerNumber: 'G6123VU' })
    visitGoalsPage()

    // When
    const goalsPage = Page.verifyOnPageWithTitle(Vc2GoalsPage, 'John Saunders’ goals in Virtual Campus (VC2)')

    // Check
    goalsPage.banner().contains('The learning and work progress service is replacing VC2 for recording goals')
  })

  it('should display goals from VC2', () => {
    // Given
    cy.setupWorkAndSkillsPageStubs({ prisonerNumber: 'G6123VU' })
    visitGoalsPage()

    // When
    const goalsPage = Page.verifyOnPageWithTitle(Vc2GoalsPage, 'John Saunders’ goals in Virtual Campus (VC2)')

    // Check
    goalsPage.employmentGoalsList().should('exist')
    goalsPage.personalGoalsList().should('exist')
    goalsPage.shortTermGoalsList().should('exist')
    goalsPage.longTermGoalsList().should('exist')
  })

  it('should display no goals message given there are no goals in VC2', () => {
    // Given
    cy.setupWorkAndSkillsPageStubs({ prisonerNumber: 'G6123VU' })
    cy.task('stubGetCuriousGoalsForPrisonerWithNoGoals')
    visitGoalsPage()

    // When
    const goalsPage = Page.verifyOnPageWithTitle(Vc2GoalsPage, 'John Saunders’ goals in Virtual Campus (VC2)')

    // Check
    goalsPage.noEmploymentGoalsMessage().should('exist')
    goalsPage.noPersonalGoalsMessage().should('exist')
    goalsPage.noShortTermGoalsMessage().should('exist')
    goalsPage.noLongTermGoalsMessage().should('exist')
  })
})
