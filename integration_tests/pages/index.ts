import Page, { PageElement } from './page'

export default class IndexPage extends Page {
  constructor() {
    super('Overview')
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')
}
