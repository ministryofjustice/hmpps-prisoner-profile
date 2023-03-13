import Page, { PageElement } from './page'

export default class AlertsPage extends Page {
  h1 = (): PageElement => cy.get('h1')

  selectedTab = (): PageElement => cy.get('.govuk-tabs__list-item.govuk-tabs__list-item--selected')

  alertsList = (): PageElement => cy.get('.hmpps-alert-card-list')
}
