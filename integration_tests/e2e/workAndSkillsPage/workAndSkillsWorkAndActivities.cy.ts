import WorkAndSkillsPage from '../../pages/workAndSkillsPage'

import Page from '../../pages/page'

const visitWorkAndSkillsPage = ({ failOnStatusCode = true } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: '/prisoner/G6123VU/work-and-skills' })
}

context('Work and skills page - Work And Activities Card', () => {
  context('With a prisoner within the users caseload', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupComponentsData()
    })

    context('Default Prisoner State', () => {
      const prisonerNumber = 'G6123VU'
      beforeEach(() => {
        cy.setupBannerStubs({ prisonerNumber })
        cy.setupWorkAndSkillsPageStubs({ prisonerNumber })
        visitWorkAndSkillsPage()
      })

      context('Work and activities card', () => {
        it('The card has a list key that should contain Braille am', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.workAndActivities().currentActivities(0).activity().contains('Braille am')
        })

        it('Displays the number of absenses in the last 30 days', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.workAndActivities().unacceptableAbsenceLastMonth().contains('0')
        })

        it('The card contains the text John Saunders has no....', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage
            .workAndActivities()
            .unacceptableAbsenceLast6Months()
            .contains('John Saunders has no unacceptable absences in the last 6 months.')
        })
      })
    })

    context('Activity empty state', () => {
      const prisonerNumber = 'G6123VU'
      beforeEach(() => {
        cy.setupBannerStubs({ prisonerNumber })
        cy.setupWorkAndSkillsPageStubs({ prisonerNumber, emptyStates: true })
        visitWorkAndSkillsPage()
      })

      context('Empty Work and activities card', () => {
        it('The card shows an empty state message', () => {
          const workAndSkillsPage = Page.verifyOnPage(WorkAndSkillsPage)
          workAndSkillsPage.workAndActivities().emptyMessage().contains('John Saunders has no work or activities.')
        })
      })
    })
  })
})
