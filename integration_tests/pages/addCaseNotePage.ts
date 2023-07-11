import Page, { PageElement } from './page'

export default class AddCaseNotePage extends Page {
  h1 = (): PageElement => cy.get('h1')

  prisonerNumber = (): PageElement => cy.get('[data-qa=prison-number]')

  typeField = (): PageElement => cy.get('#type')

  subTypeField = (): PageElement => cy.get('#subType')

  textField = (): PageElement => cy.get('#text')

  dateField = (): PageElement => cy.get('#date')

  hoursField = (): PageElement => cy.get('#hours')

  minutesField = (): PageElement => cy.get('#minutes')

  saveButton = (): PageElement => cy.get('[data-qa=add-case-note-submit-button]')

  cancelButton = (): PageElement => cy.get('[data-qa=add-case-note-cancel-button]')

  backLink = (): PageElement => cy.get('[data-qa=referer-back-link]')

  errorBlock = (): PageElement => cy.get('.govuk-error-summary')
}
