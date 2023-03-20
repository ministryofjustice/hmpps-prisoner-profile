import WorkAndSkillsPage from '../pages/workAndSkillsPage'

import Page from '../pages/page'

const visitWorkAndSkillsPage = (): WorkAndSkillsPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/work-and-skills' })
  return Page.verifyOnPage(WorkAndSkillsPage)
}

context('Work and Skills Page', () => {
  const prisonerNumber = 'G6123VU'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
    cy.setupBannerStubs({ prisonerNumber })
    cy.setupWorkAndSkillsPageStubs({ prisonerNumber })
  })

  it('Work and Skills page is displayed', () => {
    visitWorkAndSkillsPage()
    cy.request('/prisoner/G6123VU/work-and-skills').its('body').should('contain', 'Work and Skills')
  })
})
