import Page from '../../../../pages/page'
import { Role } from '../../../../../server/data/enums/role'
import NotFoundPage from '../../../../pages/notFoundPage'
import WhereIsAddressPage from '../../../../pages/editPages/address/whereIsAddressPage'

const visitWhereIsAddressPage = (): WhereIsAddressPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/personal/where-is-address' })
  return Page.verifyOnPageWithTitle(WhereIsAddressPage, `Where is the address?`)
}

context('Where is Address Page', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484

  let page: WhereIsAddressPage

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

      cy.signIn({ redirectPath: '/prisoner/G6123VU/personal/where-is-address', failOnStatusCode: false })
      Page.verifyOnPage(NotFoundPage)
    })
  })

  context('Can select an option for the address', () => {
    beforeEach(() => {
      page = visitWhereIsAddressPage()
    })

    it('should display the mini banner with prisoner details', () => {
      page.miniBanner().card().should('exist')
      page.miniBanner().name().should('contain.text', 'Saunders, John')
    })

    it('should redirect to /find-uk-address', () => {
      cy.get(`input[name=radioField][value=uk]`).click()
      page.continueButton().click()

      cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/find-uk-address')
    })

    it('should redirect to /add-overseas-address', () => {
      cy.get(`input[name=radioField][value=overseas]`).click()
      page.continueButton().click()

      cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/add-overseas-address')
    })

    it('should redirect to /add-uk-no-fixed-address', () => {
      cy.get(`input[name=radioField][value=no_fixed_address]`).click()
      page.continueButton().click()

      cy.location('pathname').should('eq', '/prisoner/G6123VU/personal/add-uk-no-fixed-address')
    })

    it('should show an error if nothing is selected', () => {
      page.continueButton().click()
      page.errorSummary().should('contain.text', 'Select where the address is')
    })
  })
})
