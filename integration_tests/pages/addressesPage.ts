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
    fromDate: (): PageElement => this.primaryAddress().card().find('dl div:nth-child(3) dd'),
    comments: (): PageElement => this.primaryAddress().card().find('dl div:nth-child(4) dd'),
    addedOn: (): PageElement => this.primaryAddress().card().find('[data-qa="address-added-on"]'),
    addPhoneNumberLink: (): PageElement => this.primaryAddress().card().find('a[href*="/add-address-phone-number"]'),
    changePhoneNumberLinks: (): PageElement =>
      this.primaryAddress().card().find('a[href*="/change-address-phone-number"]'),
  })

  mailAddress = () => ({
    card: (): PageElement => cy.get('#mail-address'),
    header: (): PageElement => this.mailAddress().card().find('[data-qa=summary-header] > h2'),
    address: (): PageElement => this.mailAddress().card().find('dl div:nth-child(1) dd'),
    typeOfAddress: (): PageElement => this.mailAddress().card().find('dl div:nth-child(2) dd'),
    fromDate: (): PageElement => this.mailAddress().card().find('dl div:nth-child(3) dd'),
    comments: (): PageElement => this.mailAddress().card().find('dl div:nth-child(4) dd'),
  })

  otherAddresses = () => ({
    card: (): PageElement => cy.get('#other-addresses'),
    header: (): PageElement => this.otherAddresses().card().find('[data-qa=summary-header] > h2'),
  })

  otherAddress = () => ({
    card: (): PageElement => cy.get('[data-qa=other-address]').eq(0),
    address: (): PageElement => this.otherAddress().card().find('dl div:nth-child(1) dd'),
    typeOfAddress: (): PageElement => this.otherAddress().card().find('dl div:nth-child(2) dd'),
    fromDate: (): PageElement => this.otherAddress().card().find('dl div:nth-child(3) dd'),
    comments: (): PageElement => this.otherAddress().card().find('dl div:nth-child(4) dd'),
  })

  layout = (): PageElement => cy.get('.govuk-grid-row.hmpps-three-quarters-responsive')

  firstAddressRow = (): PageElement => cy.get('.address-cards .govuk-summary-list__row').first()

  phoneNumberLinks = (prisonerNumber: string, addressId: number) => {
    const addSelector = `a[href="/prisoner/${prisonerNumber}/addresses/${addressId}/add-address-phone-number?returnTo=addresses"]`
    const changePath = `/prisoner/${prisonerNumber}/addresses/${addressId}/change-address-phone-number/`
    return {
      add: (): PageElement => cy.get(addSelector),
      addAction: (): PageElement =>
        cy
          .contains('.govuk-summary-list__key', 'Phone numbers')
          .closest('.govuk-summary-list__row')
          .find('.govuk-summary-list__actions')
          .find(addSelector),
      changeActions: (): PageElement =>
        cy.get(`a[href*="${changePath}"]`).closest('.govuk-summary-list__row').find('.govuk-summary-list__actions'),
      change: (phoneId: number): PageElement => cy.get(`a[href="${changePath}${phoneId}?returnTo=addresses"]`),
    }
  }

  addressCardBounds = ($link: JQuery<HTMLElement>): DOMRect =>
    $link.closest('.hmpps-summary-card')[0].getBoundingClientRect()

  phoneNumberActionsBounds = ($link: JQuery<HTMLElement>): DOMRect =>
    $link.closest('.govuk-summary-list__actions')[0].getBoundingClientRect()

  noAddressesMessage = () => cy.get('[data-qa=no-addresses-message]')
}
