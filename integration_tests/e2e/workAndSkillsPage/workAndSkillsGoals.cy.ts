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
  })

  it('should display the Goals card with populated goals given prisoner has goals', () => {
    // Given
    cy.setupWorkAndSkillsPageStubs({ prisonerNumber, emptyStates: false })

    // When
    visitWorkAndSkillsPage()

    // Then
    const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
    workAndSkillsPage.GoalsCard().should('exist')
    workAndSkillsPage.GoalsHeader().should('exist')
    workAndSkillsPage.GoalsHeader().contains('Goals')

    workAndSkillsPage.GoalsInfo().should('exist')
    workAndSkillsPage
      .GoalsInfo()
      .contains(
        'The prisoner education team set these goals using Virtual Campus. They do not include sentence plan targets. Contact the local education team to find out more.',
      )

    workAndSkillsPage.GoalsEmploymentLabel().should('exist')
    workAndSkillsPage.GoalsEmploymentLabel().contains('Employment goals')

    workAndSkillsPage.GoalsEmploymentText().should('exist')
    workAndSkillsPage.GoalsEmploymentText().contains('An employment goal')

    workAndSkillsPage.GoalsPersonalLabel().should('exist')
    workAndSkillsPage.GoalsPersonalLabel().contains('Personal goals')

    workAndSkillsPage.GoalsPersonalText().should('exist')
    workAndSkillsPage.GoalsPersonalText().contains('A personal goal')

    workAndSkillsPage.GoalsShortTermLabel().should('exist')
    workAndSkillsPage.GoalsShortTermLabel().contains('Short-term goals')

    workAndSkillsPage.GoalsShortTermText().should('exist')
    workAndSkillsPage.GoalsShortTermText().contains('A short term goal')

    workAndSkillsPage.GoalsLongTermLabel().should('exist')
    workAndSkillsPage.GoalsLongTermLabel().contains('Long-term goals')

    workAndSkillsPage.GoalsLongTermText().should('exist')
    workAndSkillsPage.GoalsLongTermText().contains('A long term goal')
  })

  it('should display the Goals card with no populated goals given prisoner has no goals', () => {
    // Given
    cy.setupWorkAndSkillsPageStubs({ prisonerNumber, emptyStates: true })

    // When
    visitWorkAndSkillsPage()

    // Then
    const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
    workAndSkillsPage.GoalsHeader().should('exist')
    workAndSkillsPage.GoalsHeader().contains('Goals')

    workAndSkillsPage.GoalsInfo().should('exist')
    workAndSkillsPage
      .GoalsInfo()
      .contains(
        'The prisoner education team set these goals using Virtual Campus. They do not include sentence plan targets. Contact the local education team to find out more.',
      )

    workAndSkillsPage.GoalsEmploymentLabel().should('exist')
    workAndSkillsPage.GoalsEmploymentLabel().contains('Employment goals')

    workAndSkillsPage.GoalsEmploymentText().should('exist')
    workAndSkillsPage.GoalsEmploymentText().contains('The prisoner does not have any employment goals.')

    workAndSkillsPage.GoalsPersonalLabel().should('exist')
    workAndSkillsPage.GoalsPersonalLabel().contains('Personal goals')

    workAndSkillsPage.GoalsPersonalText().should('exist')
    workAndSkillsPage.GoalsPersonalText().contains('The prisoner does not have any personal goals.')

    workAndSkillsPage.GoalsShortTermLabel().should('exist')
    workAndSkillsPage.GoalsShortTermLabel().contains('Short-term goals')

    workAndSkillsPage.GoalsShortTermText().should('exist')
    workAndSkillsPage.GoalsShortTermText().contains('The prisoner does not have any short-term goals.')

    workAndSkillsPage.GoalsLongTermLabel().should('exist')
    workAndSkillsPage.GoalsLongTermLabel().contains('Long-term goals')

    workAndSkillsPage.GoalsLongTermText().should('exist')
    workAndSkillsPage.GoalsLongTermText().contains('The prisoner does not have any long term goals.')
  })
})
