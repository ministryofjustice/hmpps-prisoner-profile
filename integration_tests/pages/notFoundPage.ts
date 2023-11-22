import Page from './page'

export default class NotFoundPage extends Page {
  constructor() {
    super('Page not found')
  }

  shouldBeDisplayed() {
    cy.getDataQa('page-not-found').should('be.visible')
    cy.getDataQa('back-link').should('not.exist')
  }
}
