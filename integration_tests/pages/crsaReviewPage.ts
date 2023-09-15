import Page, { PageElement } from './page'

export default class CsraReviewPage extends Page {
  h1 = (): PageElement => cy.get('h1')

  csraValue = (): PageElement => cy.get(':nth-child(1) > .govuk-summary-list__value')

  authorisedBy = (): PageElement => cy.get(':nth-child(2) > .govuk-summary-list__value')

  location = (): PageElement => cy.get(':nth-child(3) > .govuk-summary-list__value')

  comments = (): PageElement => cy.get(':nth-child(4) > .govuk-summary-list__value')

  reviewedBy = (): PageElement => cy.get(':nth-child(5) > .govuk-summary-list__value')

  nextReviewDate = (): PageElement => cy.get(':nth-child(6) > .govuk-summary-list__value')

  reviewQuestions = (): PageElement => cy.get('[data-test="review-questions"]')
}
