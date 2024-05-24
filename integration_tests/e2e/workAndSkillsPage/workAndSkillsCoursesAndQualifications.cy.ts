import WorkAndSkillsPage from '../../pages/workAndSkillsPage'

import Page from '../../pages/page'

const visitWorkAndSkillsPage = ({ failOnStatusCode = true } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: '/prisoner/G6123VU/work-and-skills' })
}

context('Work and skills page - Courses And Qualification Card', () => {
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

      context('Courses and Qualifications card', () => {
        it('The card is displayed', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.CAQ_card().should('exist')
        })
        it('The card summary header contains Courses and qualifications', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.CAQ_header().contains('Courses and qualifications')
        })

        it('The card contains information about the card', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage
            .CAQ_info()
            .contains('This only includes educational courses. Contact the local education team to find out more.')
        })

        it('The card has a heading containing Current courses', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.CAQ_courses().contains('Current courses')
        })

        it('The card has a list key should contain "GCSE Maths"', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.CAQ_listKey().contains('GCSE Maths')
        })

        it('The card has a list value should contain end date 23 December 2016', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.CAQ_listValue().contains('Planned end date on 23 December 2016')
        })

        it('The card has a CTA link', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.CAQ_viewHistory().contains('View full course history')
        })
      })
    })
  })
})
