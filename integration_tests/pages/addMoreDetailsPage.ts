import Page, { PageElement } from './page'

export default class AddMoreDetailsPage extends Page {
  h1 = (): PageElement => cy.get('h1')

  description = (): PageElement => cy.get('[data-qa=alert-description]')

  addedBy = (): PageElement => cy.get('[data-qa=added-by]')

  lastUpdatedBy = (): PageElement => cy.get('[data-qa=last-updated-by]')

  startDate = (): PageElement => cy.get('[data-qa=start-date]')

  endDate = (): PageElement => cy.get('[data-qa=end-date]')

  comments = (): PageElement => cy.get('[data-qa=description-field]')

  updateButton = (): PageElement => cy.get('[data-qa=update-button]')

  cancelButton = (): PageElement => cy.get('[data-qa=cancel-button]')

  backLink = (): PageElement => cy.get('[data-qa=referer-back-link]')

  errorBlock = (): PageElement => cy.get('.govuk-error-summary')
}
