import Page, { type PageElement } from './page'
import PagedList from './pageElements/pagedList'

export default class AlertsPage extends Page {
  h1 = (): PageElement => cy.get('h1')

  selectedTab = (): PageElement => cy.get('.govuk-tabs__list-item.govuk-tabs__list-item--selected')

  alertsList = (): PageElement => cy.get('.hmpps-alert-card-list')

  alertsListItem = (): PageElement => cy.get('.hmpps-alert-card-list .hmpps-alert-card-list-item')

  alertsEmptyState = (): PageElement => cy.getDataQa('alerts-empty-state')

  public pagedList = new PagedList()

  sort = (): PageElement => cy.get('#sort')

  filterCheckbox = (): PageElement => cy.get('.hmpps-side-filter .govuk-checkboxes__item').first().find('input')

  filterApplyButton = (): PageElement => cy.getDataQa('apply-filter-button')

  addAlertButton = (): PageElement => cy.get('#add-alert-action-button a')

  addMoreDetailsLink = (): PageElement => cy.getDataQa('add-more-details-link')

  closeAlertLink = (): PageElement => cy.getDataQa('close-alert-link')

  changeEndDateLink = (): PageElement => cy.getDataQa('change-end-date-link')

  bannerApiUnavailableBanner = (): PageElement => cy.get('.alerts-list .dps-banner__error')

  pageApiUnavailableBanner = (): PageElement => cy.get('main .dps-banner__error')
}
