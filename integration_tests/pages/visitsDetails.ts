import Page, { PageElement } from './page'
import HmppsPagination from './pageElements/hmppsPagination'

export default class VisitsDetails extends Page {
  public pagination: HmppsPagination = new HmppsPagination()

  constructor(title: string) {
    super(title)
  }

  visitsList = (): PageElement => cy.getDataQa('visits-list')

  visits = (): PageElement => this.visitsList().findDataQa('visit')

  visitsEmptyState = (): PageElement => cy.getDataQa('visits-empty-state')

  filterType = (): PageElement => cy.get('#type')

  filterApplyButton = (): PageElement => cy.get('[data-qa=apply-filter-button]')
}
