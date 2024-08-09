import WorkAndSkillsPage from '../../pages/workAndSkillsPage'

import Page from '../../pages/page'

const visitWorkAndSkillsPage = ({ failOnStatusCode = true } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: '/prisoner/G6123VU/work-and-skills' })
}

context('Work and skills page - Goals card', () => {
  const prisonerNumber = 'G6123VU'

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupBannerStubs({ prisonerNumber })
    cy.setupWorkAndSkillsPageStubs({ prisonerNumber })
  })

  it('should display the Goals card with populated goals given prisoner has VC2 goals only', () => {
    // Given
    cy.task('stubGetCuriousGoals', prisonerNumber)
    cy.task('stubGetPlpActiveGoalsForPrisonerWithNoGoals', prisonerNumber)

    // When
    visitWorkAndSkillsPage()

    // Then
    const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
    workAndSkillsPage.GoalsInfo().should('exist')
    workAndSkillsPage.Vc2GoalsSummary().should('exist')
  })

  it('should display the Goals card with no populated goals given prisoner has no goals (empty goals from Curious)', () => {
    // Given
    cy.task('stubGetCuriousGoalsForPrisonerWithNoGoals', prisonerNumber)
    cy.task('stubGetPlpActiveGoalsForPrisonerWithNoGoals', prisonerNumber)

    // When
    visitWorkAndSkillsPage()

    // Then
    const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
    workAndSkillsPage.GoalsInfo().should('exist')
    workAndSkillsPage.NoGoalsSummary().should('exist')
  })

  it('should display the Goals card with no populated goals given prisoner has no goals (404 from Curious)', () => {
    // Given
    cy.task('stubGetCuriousGoals404Error', prisonerNumber)
    cy.task('stubGetPlpActiveGoalsForPrisonerWithNoGoals', prisonerNumber)

    // When
    visitWorkAndSkillsPage()

    // Then
    const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
    workAndSkillsPage.GoalsInfo().should('exist')
    workAndSkillsPage.NoGoalsSummary().should('exist')
  })

  it('should display the Goals card with no populated goals given prisoner has no plan yet (404 from Curious)', () => {
    // Given
    cy.task('stubGetCuriousGoals404Error', prisonerNumber)
    cy.task('stubGetPlpActiveGoalsPrisonerHasNoPlanYet', prisonerNumber)

    // When
    visitWorkAndSkillsPage()

    // Then
    const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
    workAndSkillsPage.GoalsInfo().should('exist')
    workAndSkillsPage.NoGoalsSummary().should('exist')
  })

  it('should display the Goals card with populated goals given prisoner has PLP goals only (empty goals from Curious)', () => {
    // Given
    cy.task('stubGetCuriousGoalsForPrisonerWithNoGoals', prisonerNumber)
    cy.task('stubGetPlpActiveGoals', prisonerNumber)

    // When
    visitWorkAndSkillsPage()

    // Then
    const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
    workAndSkillsPage.GoalsInfo().should('exist')
    workAndSkillsPage.PlpGoalsSummary().should('exist')
  })

  it('should display the Goals card with populated goals given prisoner has PLP goals only (404 from Curious)', () => {
    // Given
    cy.task('stubGetCuriousGoals404Error', prisonerNumber)
    cy.task('stubGetPlpActiveGoals', prisonerNumber)

    // When
    visitWorkAndSkillsPage()

    // Then
    const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
    workAndSkillsPage.GoalsInfo().should('exist')
    workAndSkillsPage.PlpGoalsSummary().should('exist')
  })

  it('should display the Goals card with populated goals given prisoner has both PLP and VC2 goals', () => {
    // Given
    cy.task('stubGetCuriousGoals', prisonerNumber)
    cy.task('stubGetPlpActiveGoals', prisonerNumber)

    // When
    visitWorkAndSkillsPage()

    // Then
    const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
    workAndSkillsPage.GoalsInfo().should('exist')
    workAndSkillsPage.PlpVc2GoalsSummary().should('exist')
  })

  it('should display the Goals card informing the user the Goals could not be retrieved given there was a problem getting the VC2 goals', () => {
    // Given
    cy.task('stubGetCuriousGoals500Error', prisonerNumber)
    cy.task('stubGetPlpActiveGoals', prisonerNumber)

    // When
    visitWorkAndSkillsPage()

    // Then
    const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
    workAndSkillsPage.GoalsInfo().should('not.exist')
    workAndSkillsPage.ProblemRetrievingGoals().should('exist')
  })

  it('should display the Goals card informing the user the Goals could not be retrieved given there was a problem getting the PLP goals', () => {
    // Given
    cy.task('stubGetCuriousGoals', prisonerNumber)
    cy.task('stubGetPlpActiveGoals500Error', prisonerNumber)

    // When
    visitWorkAndSkillsPage()

    // Then
    const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
    workAndSkillsPage.GoalsInfo().should('not.exist')
    workAndSkillsPage.ProblemRetrievingGoals().should('exist')
  })
})
