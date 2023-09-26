import Page, { PageElement } from './page'

export default class CsraHistoryPage extends Page {
  h1 = (): PageElement => cy.get('h1')

  csraList = (): PageElement => cy.get('[role="list"]')

  firstCsra = (): PageElement => cy.get('[role="list"] > :nth-child(1)')

  filters = (): PageElement => cy.get('[data-qa="csra-filters"]')

  applyFiltersBtn = (): PageElement => cy.get('[data-qa="apply-filter-button"]')
}
