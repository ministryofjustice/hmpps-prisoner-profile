import WorkAndSkillsPage from '../../pages/workAndSkillsPage'

import Page from '../../pages/page'

const visitWorkAndSkillsPage = ({ failOnStatusCode = true } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: '/prisoner/G6123VU/work-and-skills' })
}

context('Work and skills page - Employability Skills Card', () => {
  context('With a prisoner within the users caseload', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
    })

    context('Default Prisoner State', () => {
      const prisonerNumber = 'G6123VU'
      beforeEach(() => {
        cy.setupBannerStubs({ prisonerNumber })
        cy.setupWorkAndSkillsPageStubs({ prisonerNumber })
        visitWorkAndSkillsPage()
      })

      context('Employability skills card', () => {
        it('The card is displayed', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.ES_card().should('exist')
        })
        it('The card summary header should display', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.ES_header().should('exist')
          workAndSkillsPage.ES_header().contains('Employability skills')
          workAndSkillsPage.ES_heading().contains('Most recent levels')
          workAndSkillsPage.ES_info().should('exist')
          workAndSkillsPage.ES_skillOne().contains('string')
          workAndSkillsPage.ES_skillLevelOne().contains('string')
        })
      })
    })
  })
})
