import ChangeNamePurposePage from '../../../../pages/editPages/alias/changeNamePurposePage'
import Page from '../../../../pages/page'
import { Role } from '../../../../../server/data/enums/role'
import NotFoundPage from '../../../../pages/notFoundPage'

const visitChangeNamePurposePage = (): ChangeNamePurposePage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/personal/change-name' })
  return Page.verifyOnPageWithTitle(ChangeNamePurposePage, `Why are you changing John Saunders’ name?`)
}

context('Change Name Purpose Page', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484

  let page: ChangeNamePurposePage

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({ roles: [Role.PrisonUser, Role.DpsApplicationDeveloper] })
    cy.setupComponentsData()
    cy.setupBannerStubs({ prisonerNumber })
    cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
  })

  context('Permissions', () => {
    it('Doesnt let the user access if they dont have the permissions', () => {
      cy.setupUserAuth({ roles: [Role.PrisonUser] })

      cy.signIn({ redirectPath: '/prisoner/G6123VU/personal/change-name', failOnStatusCode: false })
      Page.verifyOnPage(NotFoundPage)
    })
  })

  context("Can select a reason for changing the prisoner's name", () => {
    beforeEach(() => {
      page = visitChangeNamePurposePage()
    })

    it('should display the mini banner with prisoner details', () => {
      page.miniBanner().card().should('exist')
      page.miniBanner().name().should('contain.text', 'Saunders, John')
    })

    it('should redirect to new name page', () => {
      cy.get(`input[name=purpose][value=name-changed]`).click()
      page.continueButton().click()

      cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/enter-new-name')
    })

    it('should redirect to correct name page', () => {
      cy.get(`input[name=purpose][value=name-wrong]`).click()
      page.continueButton().click()

      cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/enter-corrected-name')
    })

    it('should show an error if nothing is selected', () => {
      page.continueButton().click()
      page.errorSummary().should('contain.text', "Select why you're changing John Saunders’ name")
    })
  })
})
