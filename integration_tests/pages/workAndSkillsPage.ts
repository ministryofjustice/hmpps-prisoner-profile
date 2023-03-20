import Page, { PageElement } from './page'

export default class WorkAndSkillsPage extends Page {
  constructor() {
    super('Work and Skills')
  }

  activeTab = (): PageElement => cy.get('[data-qa=active-tab]')

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  headerChangeLocation = (): PageElement => cy.get('[data-qa=header-change-location]')

  // Common

  header1 = (): PageElement => cy.get('h1')

  header2 = (): PageElement => cy.get('h2')

  header3 = (): PageElement => cy.get('h3')

  prisonerPhotoLink = (): PageElement => cy.get('[data-qa=prisoner-photo-link]')
}
