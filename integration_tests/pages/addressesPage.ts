import Page, { PageElement } from './page'

export default class AddressesPage extends Page {
  constructor() {
    super(`John Saunders’ addresses`)
  }

  primaryAddress = () => ({
    card: (): PageElement => cy.get('#primary-address'),
    header: (): PageElement => this.primaryAddress().card().find('[data-qa=summary-header] > h2'),
    address: (): PageElement => this.primaryAddress().card().find('dl div:nth-child(1) dd'),
    typeOfAddress: (): PageElement => this.primaryAddress().card().find('dl div:nth-child(2) dd'),
    phone: (): PageElement => this.primaryAddress().card().find('dl div:nth-child(3) dd'),
    comments: (): PageElement => this.primaryAddress().card().find('dl div:nth-child(4) dd'),
    fromDate: (): PageElement => this.primaryAddress().card().find('[data-qa=address-from]'),
  })

  mailAddress = () => ({
    card: (): PageElement => cy.get('#mail-address'),
    header: (): PageElement => this.mailAddress().card().find('[data-qa=summary-header] > h2'),
    address: (): PageElement => this.mailAddress().card().find('dl div:nth-child(1) dd'),
    typeOfAddress: (): PageElement => this.mailAddress().card().find('dl div:nth-child(2) dd'),
    phone: (): PageElement => this.mailAddress().card().find('dl div:nth-child(3) dd'),
    comments: (): PageElement => this.mailAddress().card().find('dl div:nth-child(4) dd'),
    fromDate: (): PageElement => this.mailAddress().card().find('[data-qa=address-from]'),
  })

  otherAddresses = () => ({
    card: (): PageElement => cy.get('#other-addresses'),
    header: (): PageElement => this.otherAddresses().card().find('[data-qa=summary-header] > h2'),
  })

  otherAddress = () => ({
    card: (): PageElement => cy.get('[data-qa=other-address]').eq(0),
    address: (): PageElement => this.otherAddress().card().find('dl div:nth-child(1) dd'),
    typeOfAddress: (): PageElement => this.otherAddress().card().find('dl div:nth-child(2) dd'),
    phone: (): PageElement => this.otherAddress().card().find('dl div:nth-child(3) dd'),
    comments: (): PageElement => this.otherAddress().card().find('dl div:nth-child(4) dd'),
    fromDate: (): PageElement => this.otherAddress().card().find('[data-qa=address-from]'),
  })

  noAddressesMessage = () => cy.get('[data-qa=no-addresses-message]')
}
