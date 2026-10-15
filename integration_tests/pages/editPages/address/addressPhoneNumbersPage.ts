import Page, { PageElement } from '../../page'

export default class AddressPhoneNumbersPage extends Page {
  constructor(pageTitle: string) {
    super(pageTitle)
  }

  phoneNumberType = (value: string): PageElement => cy.get(`input[name="phoneNumberType0"][value="${value}"]`)

  phoneNumber = (): PageElement => cy.get('input[name="phoneNumber0"]')

  phoneExtension = (): PageElement => cy.get('input[name="phoneExtension0"]')

  cancelLink = (): PageElement => cy.getDataQa('cancel-link')

  saveButton = (): PageElement => cy.getDataQa('save-address-phone-numbers')
}
