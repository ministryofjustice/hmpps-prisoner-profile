import WorkAndSkillsPage from '../../pages/workAndSkillsPage'

import Page from '../../pages/page'

const visitWorkAndSkillsPage = ({ failOnStatusCode = true } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: '/prisoner/G6123VU/work-and-skills' })
}

context('Work and skills page - Employability Skills Card', () => {
  context('With a prisoner within the users caseload', () => {
    const prisonerNumber = 'G6123VU'
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupBannerStubs({ prisonerNumber })
      cy.setupWorkAndSkillsPageStubs({ prisonerNumber })
    })

    context('Employability skills card', () => {
      it('The card is displayed', () => {
        visitWorkAndSkillsPage()
        const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
        workAndSkillsPage.ES_card().should('exist')
      })

      it('The card summary header should display', () => {
        visitWorkAndSkillsPage()
        const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
        workAndSkillsPage.ES_header().should('exist')
        workAndSkillsPage.ES_header().contains('Employability skills')
        workAndSkillsPage.ES_heading().contains('Most recent levels')
        workAndSkillsPage.ES_info().should('exist')
        workAndSkillsPage.ES_skillOne().contains('string')
        workAndSkillsPage.ES_skillLevelOne().contains('string')
      })

      it('should display curious unavailable message given curious returns error response', () => {
        cy.task('stubGetLearnerEmployabilitySkills', { prisonerNumber, error: true })
        visitWorkAndSkillsPage()
        const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
        workAndSkillsPage.ES_card().should('exist')
        workAndSkillsPage.ES_header().should('exist')
        workAndSkillsPage.ES_header().contains('Employability skills')
        workAndSkillsPage.ES_curious_unavailable_message().should('be.visible')
        workAndSkillsPage.ES_info().should('exist')
      })
    })
  })
})
