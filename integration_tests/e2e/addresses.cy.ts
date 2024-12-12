import Page from '../pages/page'
import AddressesPage from '../pages/addressesPage'
import { addressesMailMock, addressesPrimaryAndMailMock } from '../../server/data/localMockData/addresses'

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
    cy.task('stubPrisonerData', { prisonerNumber: 'G6123VU' })
  })

  it('should contain a primary address which is not a mail address', () => {
    cy.task('stubAddresses', { prisonerNumber: 'G6123VU' })
    addressesPage = visitAddressesPage()

    const primaryAddress = addressesPage.primaryAddress()
    primaryAddress.header().should('have.text', 'Primary address')
    primaryAddress.address().should('contain.text', 'Flat 7, premises address, street field')
    primaryAddress.address().should('contain.text', 'Leeds')
    primaryAddress.address().should('contain.text', 'West Yorkshire')
    primaryAddress.address().should('contain.text', 'LS1 AAA')
    primaryAddress.address().should('contain.text', 'England')
    primaryAddress.typeOfAddress().should('contain.text', 'Discharge - Permanent Housing')
    primaryAddress.typeOfAddress().should('contain.text', 'HDC Address')
    primaryAddress.phone().should('contain.text', '0113 333444')
    primaryAddress.comments().should('contain.text', 'comment')

    const otherAddresses = addressesPage.otherAddresses()
    otherAddresses.header().should('have.text', 'Other active addresses')

    const otherAddress = addressesPage.otherAddress()
    otherAddress.address().should('contain.text', 'mJymXUmJymX, kdoxkdox')
    otherAddress.address().should('contain.text', 'Doncaster')
    otherAddress.address().should('contain.text', 'South Yorkshire')
    otherAddress.typeOfAddress().should('contain.text', 'Not entered')
  })

  it('should contain a primary address which is also a mail address', () => {
    cy.task('stubAddresses', { prisonerNumber: 'G6123VU', resp: addressesPrimaryAndMailMock })
    addressesPage = visitAddressesPage()

    const primaryAddress = addressesPage.primaryAddress()
    primaryAddress.header().should('have.text', 'Primary and mail address')
    primaryAddress.address().should('contain.text', '1 Station Road')
    primaryAddress.address().should('contain.text', 'Some Town')
    primaryAddress.address().should('contain.text', 'Countyshire')
    primaryAddress.address().should('contain.text', 'CS1 1CS')
    primaryAddress.address().should('contain.text', 'England')
    primaryAddress.typeOfAddress().should('contain.text', 'Reception')
    primaryAddress.phone().should('contain.text', '0912 3456789')
    primaryAddress.phone().should('contain.text', '0912 3456788')
    primaryAddress.comments().should('contain.text', 'Example comment')
    primaryAddress.fromDate().should('have.text', 'January 2024')
  })

  it('should contain a mail address', () => {
    cy.task('stubAddresses', { prisonerNumber: 'G6123VU', resp: addressesMailMock })
    addressesPage = visitAddressesPage()

    const mailAddress = addressesPage.mailAddress()
    mailAddress.header().should('have.text', 'Mail address')
    mailAddress.address().should('contain.text', '1 Station Road')
    mailAddress.address().should('contain.text', 'Some Town')
    mailAddress.address().should('contain.text', 'Countyshire')
    mailAddress.address().should('contain.text', 'CS1 1CS')
    mailAddress.address().should('contain.text', 'England')
    mailAddress.typeOfAddress().should('contain.text', 'Reception')
    mailAddress.phone().should('contain.text', '0912 3456789')
    mailAddress.phone().should('contain.text', '0912 3456788')
    mailAddress.comments().should('contain.text', 'Example comment')
    mailAddress.fromDate().should('have.text', 'January 2024')
  })

  it('should contain no addresses', () => {
    cy.task('stubAddresses', { prisonerNumber: 'G6123VU', resp: [] })
    addressesPage = visitAddressesPage()
    addressesPage.noAddressesMessage().should('be.visible')
  })
})
