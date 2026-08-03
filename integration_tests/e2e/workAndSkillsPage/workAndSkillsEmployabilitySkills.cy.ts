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
      cy.setupComponentsData()
      cy.setupBannerStubs({ prisonerNumber })
      cy.setupWorkAndSkillsPageStubs({ prisonerNumber })
    })

    context('Employability skills card', () => {
      it('should display the card summary card given prisoner has employability skills', () => {
        cy.task('stubGetLwpEmployabilitySkills', prisonerNumber)
        visitWorkAndSkillsPage()
        const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
        workAndSkillsPage.ES_card().should('exist')
        workAndSkillsPage.ES_header().contains('Employability skills')
        workAndSkillsPage.ES_add_employability_skills_link().should('not.exist')
        workAndSkillsPage.ES_view_employability_skills_link().should('be.visible')
        workAndSkillsPage.ES_lwp_unavailable_message().should('not.exist')
      })

      it('should display the card summary card given prisoner has no employability skills', () => {
        cy.task('stubGetLwpEmployabilitySkillsForPrisonerWithNoEmployabilitySkills', prisonerNumber)
        visitWorkAndSkillsPage()
        const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
        workAndSkillsPage.ES_header().should('exist')
        workAndSkillsPage.ES_header().contains('Employability skills')
        workAndSkillsPage.ES_add_employability_skills_link().should('be.visible')
        workAndSkillsPage.ES_view_employability_skills_link().should('not.exist')
        workAndSkillsPage.ES_lwp_unavailable_message().should('not.exist')
      })

      it('should display LWP unavailable message given LWP returns error response', () => {
        cy.task('stubGetLwpEmployabilitySkills500Error', prisonerNumber)
        visitWorkAndSkillsPage()
        const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
        workAndSkillsPage.ES_card().should('exist')
        workAndSkillsPage.ES_header().should('exist')
        workAndSkillsPage.ES_header().contains('Employability skills')
        workAndSkillsPage.ES_add_employability_skills_link().should('not.exist')
        workAndSkillsPage.ES_view_employability_skills_link().should('not.exist')
        workAndSkillsPage.ES_lwp_unavailable_message().should('be.visible')
      })
    })
  })
})
