import Page from '../../../../pages/page'
import { Role } from '../../../../../server/data/enums/role'
import ConfirmAddressPage from '../../../../pages/editPages/address/confirmAddressPage'

context('Confirm Address Page', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484

  const visitConfirmAddressPage = (): ConfirmAddressPage => {
    cy.signIn({
      redirectPath: `/prisoner/G6123VU/personal/find-uk-address`,
      failOnStatusCode: false,
    }).as('currentUser')

    cy.exec(`./integration_tests/scripts/redis-cli 'SET foo bar'`)

    return Page.verifyOnPageWithTitle(ConfirmAddressPage, `Find a UK address for John Saunders`)
  }

  let page: ConfirmAddressPage

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({ roles: [Role.PrisonUser, Role.DpsApplicationDeveloper] })
    cy.setupComponentsData()
    cy.setupBannerStubs({ prisonerNumber })
    cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
    cy.task('stubFindAddressesByFreeTextSearch')
    cy.task('stubFindAddressesByUprn')
    cy.task('stubPersonalRelationshipsGetReferenceData', {
      domain: 'CITY',
      referenceData: [{ code: '123', description: 'My Post Town', isActive: true }],
    })
    cy.task('stubPersonIntegrationGetReferenceData', {
      domain: 'COUNTRY',
      referenceData: [{ code: 'ENG', description: 'England', isActive: true }],
    })
  })

  context('Can check and confirm and address', () => {
    beforeEach(() => {
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.DpsApplicationDeveloper] })

      page = visitConfirmAddressPage()
    })

    it.only('should display the mini banner with prisoner details', () => {
      page.miniBanner().card().should('exist')
      page.miniBanner().name().should('contain.text', 'Saunders, John')
    })
  })
})
