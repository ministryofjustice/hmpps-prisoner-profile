import Page, { PageElement } from './page'

export default class OverviewPage extends Page {
  constructor() {
    super('Overview')
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  headerChangeLocation = (): PageElement => cy.get('[data-qa=header-change-location]')

  miniSummaryListMacro = (): PageElement => cy.get('[data-qa=mini-summary-list-macro]')

  miniSummaryGroupA = (): PageElement => cy.get('[data-qa=overview-mini-summary-group-a]')

  miniSummaryGroupA_MacroHeader = (): PageElement =>
    cy.get('[data-qa=overview-mini-summary-group-a] [data-qa=overview-mini-summary-header]')

  miniSummaryGroupB = (): PageElement => cy.get('[data-qa=overview-mini-summary-group-b]')

  miniSummaryGroupB_MacroHeader = (): PageElement =>
    cy.get('[data-qa=overview-mini-summary-group-b] [data-qa=overview-mini-summary-header]')
}
