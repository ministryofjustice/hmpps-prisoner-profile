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
        workAndSkillsPage.FSL_header().contains('Functional skills initial assessment results')

        // Assert English assessment
        workAndSkillsPage.FSL_result(0).should('have.attr', 'data-qa', 'ENGLISH-assessment-result')
        workAndSkillsPage.FSL_result(0).find('[data-qa=assessment-level]').contains('Entry Level 2 (2.4)')
        workAndSkillsPage.FSL_result(0).find('[data-qa=assessment-date]').contains('9 Oct 2025')
        workAndSkillsPage.FSL_result(0).find('[data-qa=assessment-location]').contains('Moorland (HMP & YOI)')
        workAndSkillsPage
          .FSL_result(0)
          .find('[data-qa=assessment-next-steps]')
          .contains('Progress to course at level consistent with assessment result')
        workAndSkillsPage.FSL_result(0).find('[data-qa=assessment-referral] li').eq(0).contains('Education Specialist')

        // Assert Maths assessment
        workAndSkillsPage.FSL_result(1).should('have.attr', 'data-qa', 'MATHS-assessment-result')
        workAndSkillsPage.FSL_result(1).find('[data-qa=assessment-level]').contains('Entry Level 1')
        workAndSkillsPage.FSL_result(1).find('[data-qa=assessment-date]').contains('1 Jul 2021')
        workAndSkillsPage.FSL_result(1).find('[data-qa=assessment-location]').contains('Moorland (HMP & YOI)')
        workAndSkillsPage.FSL_result(1).find('[data-qa=assessment-next-steps]').contains('N/A')
        workAndSkillsPage.FSL_result(1).find('[data-qa=assessment-referral]').contains('N/A')

        // Assert Digital Skills assessment
        workAndSkillsPage.FSL_result(2).should('have.attr', 'data-qa', 'DIGITAL_LITERACY-assessment-result')
        workAndSkillsPage.FSL_result(2).find('[data-qa=assessment-level]').contains('Entry Level 3')
        workAndSkillsPage.FSL_result(2).find('[data-qa=assessment-date]').contains('1 Jul 2021')
        workAndSkillsPage.FSL_result(2).find('[data-qa=assessment-location]').contains('Moorland (HMP & YOI)')
        workAndSkillsPage.FSL_result(2).find('[data-qa=assessment-next-steps]').contains('N/A')
        workAndSkillsPage.FSL_result(2).find('[data-qa=assessment-referral]').contains('N/A')

        // Assert ESOL assessment
        workAndSkillsPage.FSL_result(3).should('have.attr', 'data-qa', 'ESOL-assessment-result')
        workAndSkillsPage.FSL_result(3).find('[data-qa=assessment-level]').contains('ESOL Pathway')
        workAndSkillsPage.FSL_result(3).find('[data-qa=assessment-date]').contains('5 Oct 2025')
        workAndSkillsPage.FSL_result(3).find('[data-qa=assessment-location]').contains('Moorland (HMP & YOI)')
        workAndSkillsPage
          .FSL_result(3)
          .find('[data-qa=assessment-next-steps]')
          .contains('English Language Support Level 2')
        workAndSkillsPage.FSL_result(3).find('[data-qa=assessment-referral] li').eq(0).contains('NSM')
      })

      it('should display curious unavailable message given curious returns error response', () => {
        cy.task('stubGetLearnerAssessments', { prisonerNumber, error: 500 })
        visitWorkAndSkillsPage()
        const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
        workAndSkillsPage.FSL_header().should('exist')
        workAndSkillsPage.FSL_header().contains('Functional skills initial assessment results')
        workAndSkillsPage.FSL_curious_unavailable_message().should('be.visible')
      })
    })
  })
})
