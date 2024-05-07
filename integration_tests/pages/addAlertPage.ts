import Page, { PageElement } from './page'

export default class AddAlertPage extends Page {
  h1 = (): PageElement => cy.get('h1')

  typeField = (): PageElement => cy.get('#alertType')

  subTypeField = (): PageElement => cy.get('#alertCode')

  textField = (): PageElement => cy.get('#description')

  dateField = (): PageElement => cy.get('#activeFrom')

  saveButton = (): PageElement => cy.get('[data-qa=add-alert-submit-button]')

  cancelButton = (): PageElement => cy.get('[data-qa=add-alert-cancel-button]')

  backLink = (): PageElement => cy.get('[data-qa=referer-back-link]')

  errorBlock = (): PageElement => cy.get('.govuk-error-summary')
}
