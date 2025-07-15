import WorkAndSkillsPage from '../../pages/workAndSkillsPage'

import Page from '../../pages/page'

const visitWorkAndSkillsPage = ({ failOnStatusCode = true } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: '/prisoner/G6123VU/work-and-skills' })
}

context('Work and skills page - Functional Skills Card', () => {
  context('With a prisoner within the users caseload', () => {
    const prisonerNumber = 'G6123VU'
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupComponentsData()
      cy.setupBannerStubs({ prisonerNumber })
      cy.setupWorkAndSkillsPageStubs({ prisonerNumber })
    })

    context('Functional skills level card', () => {
      it('The card is displayed', () => {
        visitWorkAndSkillsPage()
        const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
        workAndSkillsPage.FSL_card().should('exist')
      })

      it('The card details should display', () => {
        visitWorkAndSkillsPage()
        const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
        workAndSkillsPage.FSL_header().should('exist')
        workAndSkillsPage.FSL_header().contains('Functional skills level')

        workAndSkillsPage.FSL_listKey().should('exist')
        workAndSkillsPage.FSL_listKey().contains('English')

        workAndSkillsPage.FSL_listValue().should('exist')
        workAndSkillsPage.FSL_listValue().contains('string')

        workAndSkillsPage.FSL_listKey2().should('exist')
        workAndSkillsPage.FSL_listKey2().contains('Assessment date')

        workAndSkillsPage.FSL_listValue2().should('exist')
        workAndSkillsPage.FSL_listValue2().contains('1 March 2023')

        workAndSkillsPage.FSL_listKey3().should('exist')
        workAndSkillsPage.FSL_listKey3().contains('Assessment location')

        workAndSkillsPage.FSL_listValue3().should('exist')
        workAndSkillsPage.FSL_listValue3().contains('string')

        workAndSkillsPage.FSL_listKey4().should('exist')
        workAndSkillsPage.FSL_listKey4().contains('Maths')

        workAndSkillsPage.FSL_listValue4().should('exist')
        workAndSkillsPage.FSL_listValue4().contains('string')

        workAndSkillsPage.FSL_listKey5().should('exist')
        workAndSkillsPage.FSL_listKey5().contains('Assessment date')

        workAndSkillsPage.FSL_listValue5().should('exist')
        workAndSkillsPage.FSL_listValue5().contains('1 March 2023')

        workAndSkillsPage.FSL_listKey6().should('exist')
        workAndSkillsPage.FSL_listKey6().contains('Assessment location')

        workAndSkillsPage.FSL_listValue6().should('exist')
        workAndSkillsPage.FSL_listValue6().contains('string')
      })

      it('should display curious unavailable message given curious returns error response', () => {
        cy.task('stubGetLearnerLatestAssessments', { prisonerNumber, error: true })
        visitWorkAndSkillsPage()
        const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
        workAndSkillsPage.FSL_header().should('exist')
        workAndSkillsPage.FSL_header().contains('Functional skills level')
        workAndSkillsPage.FSL_curious_unavailable_message().should('be.visible')
      })
    })
  })
})
