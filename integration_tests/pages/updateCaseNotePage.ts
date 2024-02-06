import Page, { PageElement } from './page'

export default class UpdateCaseNotePage extends Page {
  h1 = (): PageElement => cy.get('h1')

  prisonerNumber = (): PageElement => cy.get('[data-qa=prison-number]')

  moreDetailsText = (): PageElement => cy.get('[data-qa=more-details-text]')

  textField = (): PageElement => cy.get('#text')

  saveButton = (): PageElement => cy.get('[data-qa=update-case-note-submit-button]')

  cancelButton = (): PageElement => cy.get('[data-qa=update-case-note-cancel-button]')

  backLink = (): PageElement => cy.get('[data-qa=referer-back-link]')

  errorBlock = (): PageElement => cy.get('.govuk-error-summary')

  omicWarning = (): PageElement => cy.get('[data-qa=omic-open-warning]')

  omicHint = (): PageElement => cy.get('[data-qa=omic-open-hint]')
}
