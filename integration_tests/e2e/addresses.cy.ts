import Page from '../pages/page'
import AddressesPage from '../pages/addressesPage'
import AddressPhoneNumbersPage from '../pages/editPages/address/addressPhoneNumbersPage'
import { Role } from '../../server/data/enums/role'
import {
  addressesMailMock,
  addressesPrimaryAndMailMock,
  mockAddresses,
} from '../../server/data/localMockData/addresses'
import { phoneUsageReferenceDataMock } from '../../server/data/localMockData/personIntegrationApiReferenceDataMock'

const prisonerNumber = 'G6123VU'
const bookingId = 1102484

const visitAddressesPage = (): AddressesPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/addresses' })
  return Page.verifyOnPageWithTitle(AddressesPage, `John Saunders’ addresses`)
}

context('Addresses page', () => {
  let addressesPage: AddressesPage

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupComponentsData()
    cy.setupBannerStubs({ prisonerNumber })
    cy.setupPersonalPageStubs({ prisonerNumber, bookingId })
    cy.task('stubPrisonerData', { prisonerNumber })
    cy.task('stubPersonIntegrationGetReferenceData', {
      domain: 'PHONE_USAGE',
      referenceData: phoneUsageReferenceDataMock,
    })
  })

  it('shows address and phone details, and hides edit links without permission', () => {
    const [primary, other] = [mockAddresses[0], mockAddresses[2]]
    cy.task('stubAddresses', { prisonerNumber, resp: [primary, other] })
    addressesPage = visitAddressesPage()

    const primaryAddress = addressesPage.primaryAddress()
    primaryAddress.header().should('have.text', 'Primary address')
    primaryAddress.address().should('contain.text', '7, premises address, street field')
    primaryAddress.address().should('contain.text', 'Leeds')
    primaryAddress.address().should('contain.text', 'West Yorkshire')
    primaryAddress.address().should('contain.text', 'LS1 AAA')
    primaryAddress.address().should('contain.text', 'England')
    primaryAddress.typeOfAddress().should('contain.text', 'Discharge - Permanent Housing')
    primaryAddress.typeOfAddress().should('contain.text', 'HDC Address')
    primaryAddress.card().should('contain.text', 'Agency Visit Line')
    primaryAddress.card().should('contain.text', '0113 333444')
    primaryAddress.comments().should('contain.text', 'comment')
    primaryAddress.addPhoneNumberLink().should('not.exist')
    primaryAddress.changePhoneNumberLinks().should('not.exist')

    const otherAddresses = addressesPage.otherAddresses()
    otherAddresses.header().should('have.text', 'Other active addresses')

    const otherAddress = addressesPage.otherAddress()
    otherAddress.address().should('contain.text', 'AjwUquiHAjwUqui')
    otherAddress.address().should('contain.text', 'Doncaster')
    otherAddress.address().should('contain.text', 'South Yorkshire')
    otherAddress.typeOfAddress().should('contain.text', 'Not entered')
    otherAddress.comments().should('contain.text', 'Not entered')
  })

  it('should contain a primary address which is also a mail address', () => {
    cy.task('stubAddresses', { prisonerNumber, resp: addressesPrimaryAndMailMock })
    addressesPage = visitAddressesPage()

    const primaryAddress = addressesPage.primaryAddress()
    primaryAddress.header().should('have.text', 'Primary and postal address')
    primaryAddress.address().should('contain.text', '1 Station Road')
    primaryAddress.address().should('contain.text', 'Some Town')
    primaryAddress.address().should('contain.text', 'Countyshire')
    primaryAddress.address().should('contain.text', 'CS1 1CS')
    primaryAddress.address().should('contain.text', 'England')
    primaryAddress.typeOfAddress().should('contain.text', 'Reception')
    primaryAddress.card().should('contain.text', '0912 3456789')
    primaryAddress.card().should('contain.text', '0912 3456788')
    primaryAddress.comments().should('contain.text', 'Example comment')
    primaryAddress.fromDate().should('contain.text', 'From January 2024')
    primaryAddress.addedOn().should('have.text', 'Added on 1 January 2024')
  })

  it('should contain a postal address', () => {
    cy.task('stubAddresses', { prisonerNumber, resp: addressesMailMock })
    addressesPage = visitAddressesPage()

    const mailAddress = addressesPage.mailAddress()
    mailAddress.header().should('have.text', 'Postal address')
    mailAddress.address().should('contain.text', '1 Station Road')
    mailAddress.address().should('contain.text', 'Some Town')
    mailAddress.address().should('contain.text', 'Countyshire')
    mailAddress.address().should('contain.text', 'CS1 1CS')
    mailAddress.address().should('contain.text', 'England')
    mailAddress.typeOfAddress().should('contain.text', 'Reception')
    mailAddress.card().should('contain.text', '0912 3456789')
    mailAddress.card().should('contain.text', '0912 3456788')
    mailAddress.comments().should('contain.text', 'Example comment')
    mailAddress.fromDate().should('contain.text', 'From January 2024')
  })

  it('should contain no addresses', () => {
    cy.task('stubAddresses', { prisonerNumber, resp: [] })
    addressesPage = visitAddressesPage()
    addressesPage.noAddressesMessage().should('be.visible')
  })

  it('adds a phone number from this page and returns to the personal page', () => {
    cy.setupUserAuth({ roles: [Role.PrisonUser, Role.PrisonerProfileSensitiveEdit] })
    const [address] = mockAddresses
    const { addressId } = address
    const requestBody = [{ phoneNumber: '01234567890', phoneNumberType: 'HOME' }]
    cy.task('stubAddresses', { prisonerNumber, resp: [address] })
    cy.task('stubAddAddressPhoneNumbers', { prisonerNumber, addressId, requestBody })

    addressesPage = visitAddressesPage()
    const addPhoneNumberLink = addressesPage.phoneNumberLinks(prisonerNumber, addressId).add
    addressesPage.layout().should('exist')
    addressesPage.phoneNumberLinks(prisonerNumber, addressId).addAction().should('exist')
    addressesPage.phoneNumberLinks(prisonerNumber, addressId).changeActions().should('contain.text', 'Change')
    addressesPage.firstAddressRow().should('have.css', 'border-bottom-style', 'none')
    const viewportWidths = [375, 641, 768, 960, 961, 1152, 1440]
    viewportWidths.forEach(width => {
      cy.viewport(width, 900)
      addPhoneNumberLink()
        .should('be.visible')
        .should($link => {
          const link = $link[0].getBoundingClientRect()
          const card = addressesPage.addressCardBounds($link)
          expect(link.left).to.be.at.least(card.left)
          expect(link.right).to.be.at.most(card.right)
          if (width >= 641) {
            const actions = addressesPage.phoneNumberActionsBounds($link)
            expect(link.left).to.be.at.least(actions.left)
            expect(link.right).to.be.at.most(actions.right)
            expect(link.height).to.be.lessThan(30)
          }
        })
    })
    addPhoneNumberLink().click()
    cy.location('pathname').should('eq', `/prisoner/${prisonerNumber}/addresses/${addressId}/add-address-phone-number`)
    const phoneNumbersPage = Page.verifyOnPageWithTitle(AddressPhoneNumbersPage, 'Add a phone number for this address')
    phoneNumbersPage.cancelLink().should('have.attr', 'href', `/prisoner/${prisonerNumber}/personal#addresses`)
    phoneNumbersPage.phoneNumberType('HOME').check()
    phoneNumbersPage.phoneNumber().type(requestBody[0].phoneNumber)
    phoneNumbersPage.saveButton().click()

    cy.location('pathname').should('eq', `/prisoner/${prisonerNumber}/personal`)
    addressesPage.flashMessage().should('contain.text', 'Address phone number updated')
  })

  it('changes a phone number from this page and returns to the personal page', () => {
    cy.setupUserAuth({ roles: [Role.PrisonUser, Role.PrisonerProfileSensitiveEdit] })
    const [address] = mockAddresses
    const { addressId, phones = [] } = address
    const [phone] = phones
    const requestBody = { phoneNumber: '02012345678', phoneNumberType: 'HOME', extension: '321' }
    cy.task('stubAddresses', { prisonerNumber, resp: [address] })
    cy.task('stubUpdateAddressPhoneNumber', { prisonerNumber, addressId, phoneId: phone.phoneId, requestBody })

    addressesPage = visitAddressesPage()
    addressesPage.phoneNumberLinks(prisonerNumber, addressId).change(phone.phoneId).click()
    const phoneNumbersPage = Page.verifyOnPageWithTitle(
      AddressPhoneNumbersPage,
      'Change the phone number for this address',
    )
    phoneNumbersPage.phoneNumberType('VISIT').should('be.checked')
    phoneNumbersPage.phoneNumber().should('have.value', phone.number)
    phoneNumbersPage.phoneNumberType('HOME').check()
    phoneNumbersPage.phoneNumber().clear()
    phoneNumbersPage.phoneNumber().type(requestBody.phoneNumber)
    phoneNumbersPage.phoneExtension().type(requestBody.extension)
    phoneNumbersPage.saveButton().click()

    cy.location('pathname').should('eq', `/prisoner/${prisonerNumber}/personal`)
    addressesPage.flashMessage().should('contain.text', 'Address phone number updated')
  })
})
