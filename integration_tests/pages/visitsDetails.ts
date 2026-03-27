import Page, { type PageElement } from './page'
import PagedList from './pageElements/pagedList'

export default class VisitsDetails extends Page {
  public pagedList = new PagedList()

  constructor(title: string) {
    super(title)
  }

  visitsList = (): PageElement => cy.getDataQa('visits-list')

  visits = (): PageElement => this.visitsList().findDataQa('visit')

  visitsEmptyState = (): PageElement => cy.getDataQa('visits-empty-state')

  filterType = (): PageElement => cy.get('#type')

  filterApplyButton = (): PageElement => cy.getDataQa('apply-filter-button')
}
