import { v4 as uuidv4 } from 'uuid'
import Page from '../../../../pages/page'
import { Role } from '../../../../../server/data/enums/role'
import { AddressRequestDto } from '../../../../../server/data/interfaces/personIntegrationApi/personIntegrationApiClient'
import NotFoundPage from '../../../../pages/notFoundPage'
import PrimaryOrPostalAddressPage from '../../../../pages/editPages/address/primaryOrPostalAddressPage'
import { AddressResponseMock } from '../../../../../server/data/localMockData/personIntegrationApiReferenceDataMock'

context('Primary or Postal Address Page', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484
  const addressCacheId = uuidv4()
  const addressKey = `ephemeral:${addressCacheId}`
  const address: AddressRequestDto = {
    buildingNumber: '1',
    subBuildingName: 'Sub Building Name',
    buildingName: 'Building Name',
    thoroughfareName: 'My Street',
    dependantLocality: 'My Locality',
    postTownCode: 'CITY1',
    countyCode: 'COUNTY1',
    countryCode: 'COUNTRY1',
    postCode: 'A1 2BC',
    fromDate: '2025-06-10',
    addressTypes: [],
  }

  before(() => {
    cy.seedRedisEntry({ key: addressKey, value: { address, route: 'find-uk-address' } })
  })

  const visitPrimaryOrPostalAddressPage = (): PrimaryOrPostalAddressPage => {
    cy.signIn({
      redirectPath: `/prisoner/G6123VU/personal/primary-or-postal-address?address=${addressCacheId}`,
      failOnStatusCode: false,
    })

    return Page.verifyOnPageWithTitle(PrimaryOrPostalAddressPage, `Is this John Saunders’ primary or postal address?`)
  }

  let page: PrimaryOrPostalAddressPage

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({ roles: [Role.PrisonUser, Role.DpsApplicationDeveloper] })
    cy.setupComponentsData()
    cy.setupBannerStubs({ prisonerNumber })
    cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
    cy.task('stubFindAddressesByFreeTextSearch')
    cy.task('stubFindAddressesByUprn')
    cy.task('stubGetAddresses', { prisonerNumber })
    cy.task('stubCreateAddress', { prisonerNumber })
    cy.task('stubPersonalRelationshipsGetReferenceData', {
      domain: 'CITY',
      referenceData: [{ code: 'CITY1', description: 'My Post Town', isActive: true }],
    })
    cy.task('stubPersonIntegrationGetReferenceData', {
      domain: 'COUNTY',
      referenceData: [{ code: 'COUNTY1', description: 'My County', isActive: true }],
    })
    cy.task('stubPersonIntegrationGetReferenceData', {
      domain: 'COUNTRY',
      referenceData: [{ code: 'COUNTRY1', description: 'My Country', isActive: true }],
    })
  })

  context('Permissions', () => {
    it('Doesnt let the user access if they dont have the permissions', () => {
      cy.setupUserAuth({ roles: [Role.PrisonUser] })

      cy.signIn({
        redirectPath: `/prisoner/G6123VU/personal/primary-or-postal-address?address=${addressCacheId}`,
        failOnStatusCode: false,
      })

      Page.verifyOnPage(NotFoundPage)
    })
  })

  context('Can render and submit the page', () => {
    beforeEach(() => {
      page = visitPrimaryOrPostalAddressPage()
    })

    it('should display the mini banner with prisoner details', () => {
      page.miniBanner().card().should('exist')
      page.miniBanner().name().should('contain.text', 'Saunders, John')
    })

    it('should display the address', () => {
      page.addressLine(0).should('contain.text', 'Sub Building Name')
      page.addressLine(1).should('contain.text', 'Building Name')
      page.addressLine(2).should('contain.text', '1 My Street')
      page.addressLine(3).should('contain.text', 'My Locality')
      page.addressLine(4).should('contain.text', 'My Post Town')
      page.addressLine(5).should('contain.text', 'My County')
      page.addressLine(6).should('contain.text', 'A1 2BC')
      page.addressLine(7).should('contain.text', 'My Country')
    })

    it('links are correct', () => {
      page.cancelLink().should('have.attr', 'href').and('eq', `/prisoner/G6123VU/personal#addresses`)
      page
        .backLink()
        .should('have.attr', 'href')
        .and('eq', `/prisoner/G6123VU/personal/confirm-address?address=${addressCacheId}`)
    })

    it('Can submit a selected address type', () => {
      page.warning('primary').should('not.exist')
      page.warning('postal').should('not.exist')

      page.checkBox('primary').click()
      page.submitButton().click()

      cy.location('pathname').should('eq', `/prisoner/${prisonerNumber}/personal`)
      cy.location('hash').should('eq', `#addresses`)
      page.flashMessage().should('include.text', 'Address updated')

      // ...and put the entry back again for other tests
      cy.seedRedisEntry({ key: addressKey, value: { address, route: 'find-uk-address' } })
    })
  })

  context('When prisoner already has a primary and postal address', () => {
    beforeEach(() => {
      cy.task('stubGetAddresses', {
        prisonerNumber,
        response: [{ ...AddressResponseMock, primaryAddress: true, postalAddress: true }],
      })

      page = visitPrimaryOrPostalAddressPage()
    })

    it('Can submit a selected address type', () => {
      page.warning('primary').should('include.text', 'This person already has a primary address')
      page.warning('postal').should('include.text', 'This person already has a postal address')
    })
  })
})
