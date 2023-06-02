import Page from '../pages/page'
import OverviewPage from '../pages/overviewPage'

const visitOverviewPage = (): OverviewPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU' })
  return Page.verifyOnPage(OverviewPage)
}

context('Profile banner', () => {
  context('Given the prisoner is not within the users caseload', () => {
    context('Given the user has the GLOBAL_SEARCH role', () => {
      beforeEach(() => {
        cy.task('reset')
        cy.setupUserAuth({
          roles: ['ROLE_GLOBAL_SEARCH'],
          caseLoads: [{ caseloadFunction: '', caseLoadId: '123', currentlyActive: true, description: '', type: '' }],
        })
        cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      })

      it('Displays the banner', () => {
        visitOverviewPage()
        cy.getDataQa('visible-outside-establishment-banner').should('exist')
      })
    })
  })

  context('Given the prisoner is within the users caseload', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        roles: ['ROLE_PRISON'],
        caseLoads: [{ caseloadFunction: '', caseLoadId: 'MDI', currentlyActive: true, description: '', type: '' }],
      })
      cy.setupOverviewPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
    })

    it('Hides the banner', () => {
      visitOverviewPage()
      cy.getDataQa('hidden-outside-establishment-banner').should('exist')
    })
  })
})
