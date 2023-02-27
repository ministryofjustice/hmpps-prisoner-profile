import Page, { PageElement } from './page'

export default class PersonalDetailsPage extends Page {
  constructor() {
    super('Personal')
  }

  activeTab = (): PageElement => cy.get('[data-qa=active-tab]')
}
