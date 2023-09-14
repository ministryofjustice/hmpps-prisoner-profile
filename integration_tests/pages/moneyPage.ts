import Page, { PageElement } from './page'

export default class MoneyPage extends Page {
  h1 = (): PageElement => cy.get('h1')

  selectedTab = (): PageElement => cy.get('.govuk-tabs__list-item.govuk-tabs__list-item--selected')

  h2 = (): PageElement => cy.get('header > h2')

  currentBalance = (): PageElement => cy.get('[data-qa=current-balance]')

  pendingBalance = (): PageElement => cy.get('[data-qa=pending-balance]')

  currentlyOwes = (): PageElement => cy.get('[data-qa=currently-owes]')

  moneyTabFilter = (): PageElement => cy.get('.money-tab-filter')

  pendingTransactionsTable = (): PageElement => cy.get('[data-qa=pending-table]')

  transactionsTable = (): PageElement => cy.get('[data-qa=transactions-table]')

  damageObligationsTable = (): PageElement => cy.get('[data-qa=damage-obligations-table]')

  backLink = (): PageElement => cy.get('[data-qa=money-back-link]')
}
