import Page, { PageElement } from './page'

export default class SpecificPrisonerLocationHistoryPage extends Page {
  constructor() {
    super('Location details')
  }

  h1 = (): PageElement => cy.get('h1')
}
