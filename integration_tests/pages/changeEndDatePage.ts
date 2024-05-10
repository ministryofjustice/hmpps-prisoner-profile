import Page, { PageElement } from './page'

export default class ChangeEndDatePage extends Page {
  h1 = (): PageElement => cy.get('h1')

  description = (): PageElement => cy.get('[data-qa=alert-description]')

  addedBy = (): PageElement => cy.get('[data-qa=added-by]')

  lastUpdatedBy = (): PageElement => cy.get('[data-qa=last-updated-by]')

  startDate = (): PageElement => cy.get('[data-qa=start-date]')

  endDate = (): PageElement => cy.get('[data-qa=end-date]')

  comments = (): PageElement => cy.get('[data-qa=description-field]')

  changeEndDateSection = (): PageElement => cy.get('[data-qa=change-end-date-section]')

  changeEndDateRadio = (): PageElement => cy.get('[data-qa=change-end-date-radio] + label')

  removeEndDateRadio = (): PageElement => cy.get('[data-qa=remove-end-date-radio] + label')

  endDateField = (): PageElement => cy.get('#activeTo')

  confirmButton = (): PageElement => cy.get('[data-qa=confirm-button]')

  cancelButton = (): PageElement => cy.get('[data-qa=cancel-button]')

  backLink = (): PageElement => cy.get('[data-qa=referer-back-link]')

  errorBlock = (): PageElement => cy.get('.govuk-error-summary')
}
