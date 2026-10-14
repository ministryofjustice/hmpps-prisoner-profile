import Page from '../pages/page'
import AddressesPage from '../pages/addressesPage'
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
    primaryAddress.card().find('a[href*="/add-address-phone-number"]').should('not.exist')
    primaryAddress.card().find('a[href*="/change-address-phone-number"]').should('not.exist')

    const otherAddresses = addressesPage.otherAddresses()
    otherAddresses.header().should('have.text', 'Other active addresses')

    const otherAddress = addressesPage.otherAddress()
    otherAddress.address().should('contain.text', 'AjwUquiHAjwUqui')
    otherAddress.address().should('contain.text', 'Doncaster')
    otherAddress.address().should('contain.text', 'South Yorkshire')
    otherAddress.typeOfAddress().should('contain.text', 'Not entered')
    otherAddress.card().find('dl div:nth-child(4) dd').should('contain.text', 'Not entered')
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
    primaryAddress.card().find('[data-qa="address-added-on"]').should('have.text', 'Added on 1 January 2024')
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

  it('adds a phone number from this page and returns here', () => {
    cy.setupUserAuth({ roles: [Role.PrisonUser, Role.PrisonerProfileSensitiveEdit] })
    const [address] = mockAddresses
    const { addressId } = address
    const requestBody = [{ phoneNumber: '01234567890', phoneNumberType: 'HOME' }]
    const addPhoneNumberLink = `a[href="/prisoner/${prisonerNumber}/addresses/${addressId}/add-address-phone-number?returnTo=addresses"]`
    cy.task('stubAddresses', { prisonerNumber, resp: [address] })
    cy.task('stubAddAddressPhoneNumbers', { prisonerNumber, addressId, requestBody })

    addressesPage = visitAddressesPage()
    cy.get('.govuk-grid-row.hmpps-three-quarters-responsive').should('exist')
    cy.contains('.govuk-summary-list__key', 'Phone numbers')
      .closest('.govuk-summary-list__row')
      .find('.govuk-summary-list__actions')
      .find(addPhoneNumberLink)
      .should('exist')
    cy.get(`a[href*="/prisoner/${prisonerNumber}/addresses/${addressId}/change-address-phone-number/"]`)
      .closest('.govuk-summary-list__row')
      .find('.govuk-summary-list__actions')
      .should('contain.text', 'Change')
    cy.get('.address-cards .govuk-summary-list__row').first().should('have.css', 'border-bottom-style', 'none')
    ;[375, 641, 768, 960, 961, 1152, 1440].forEach(width => {
      cy.viewport(width, 900)
      cy.get(addPhoneNumberLink)
        .should('be.visible')
        .should($link => {
          const link = $link[0].getBoundingClientRect()
          const card = $link.closest('.hmpps-summary-card')[0].getBoundingClientRect()
          expect(link.left).to.be.at.least(card.left)
          expect(link.right).to.be.at.most(card.right)
          if (width >= 641) {
            const actions = $link.closest('.govuk-summary-list__actions')[0].getBoundingClientRect()
            expect(link.left).to.be.at.least(actions.left)
            expect(link.right).to.be.at.most(actions.right)
            expect(link.height).to.be.lessThan(30)
          }
        })
    })
    cy.get(addPhoneNumberLink).click()
    cy.location('pathname').should('eq', `/prisoner/${prisonerNumber}/addresses/${addressId}/add-address-phone-number`)
    cy.getDataQa('cancel-link').should('have.attr', 'href', `/prisoner/${prisonerNumber}/addresses`)
    cy.get('input[name="phoneNumberType0"][value="HOME"]').check()
    cy.get('input[name="phoneNumber0"]').type(requestBody[0].phoneNumber)
    cy.getDataQa('save-address-phone-numbers').click()

    cy.location('pathname').should('eq', `/prisoner/${prisonerNumber}/addresses`)
    cy.get('.hmpps-flash-message').should('contain.text', 'Address phone number updated')
  })

  it('changes a phone number from this page and returns here', () => {
    cy.setupUserAuth({ roles: [Role.PrisonUser, Role.PrisonerProfileSensitiveEdit] })
    const [address] = mockAddresses
    const { addressId, phones = [] } = address
    const [phone] = phones
    const requestBody = { phoneNumber: '02012345678', phoneNumberType: 'HOME', extension: '321' }
    cy.task('stubAddresses', { prisonerNumber, resp: [address] })
    cy.task('stubUpdateAddressPhoneNumber', { prisonerNumber, addressId, phoneId: phone.phoneId, requestBody })

    addressesPage = visitAddressesPage()
    cy.get(
      `a[href="/prisoner/${prisonerNumber}/addresses/${addressId}/change-address-phone-number/${phone.phoneId}?returnTo=addresses"]`,
    ).click()
    cy.get('input[name="phoneNumberType0"][value="VISIT"]').should('be.checked')
    cy.get('input[name="phoneNumber0"]').should('have.value', phone.number)
    cy.get('input[name="phoneNumberType0"][value="HOME"]').check()
    cy.get('input[name="phoneNumber0"]').clear()
    cy.get('input[name="phoneNumber0"]').type(requestBody.phoneNumber)
    cy.get('input[name="phoneExtension0"]').type(requestBody.extension)
    cy.getDataQa('save-address-phone-numbers').click()

    cy.location('pathname').should('eq', `/prisoner/${prisonerNumber}/addresses`)
    cy.get('.hmpps-flash-message').should('contain.text', 'Address phone number updated')
  })
})
