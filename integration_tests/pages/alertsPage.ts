import Page, { PageElement } from './page'

export default class AlertsPage extends Page {
  h1 = (): PageElement => cy.get('h1')

  selectedTab = (): PageElement => cy.get('.govuk-tabs__list-item.govuk-tabs__list-item--selected')

  alertsList = (): PageElement => cy.get('.hmpps-alert-card-list')

  alertsListItem = (): PageElement => cy.get('.hmpps-alert-card-list .hmpps-alert-card-list-item')

  alertsEmptyState = (): PageElement => cy.get('[data-qa=alerts-empty-state]')

  paginationHeader = (): PageElement => cy.get('.hmpps-paged-list-header .moj-pagination')

  paginationSummaryHeader = (): PageElement => cy.get('.hmpps-paged-list-header .moj-pagination__results')

  paginationFooter = (): PageElement => cy.get('.hmpps-paged-list-footer .moj-pagination')

  paginationSummaryFooter = (): PageElement => cy.get('.hmpps-paged-list-footer .moj-pagination__results')

  paginationPreviousLink = (): PageElement => cy.get('.moj-pagination__item.moj-pagination__item--prev')

  paginationNextLink = (): PageElement => cy.get('.moj-pagination__item.moj-pagination__item--next')

  paginationCurrentPage = (): PageElement => cy.get('.moj-pagination__item.moj-pagination__item--active')

  paginationHeaderPageLink = (): PageElement =>
    cy.get(
      '.hmpps-paged-list-header .moj-pagination__item:not(.moj-pagination__item--active):not(.moj-pagination__item--prev):not(.moj-pagination__item--next)',
    )

  paginationFooterPageLink = (): PageElement =>
    cy.get(
      '.hmpps-paged-list-footer .moj-pagination__item:not(.moj-pagination__item--active):not(.moj-pagination__item--prev):not(.moj-pagination__item--next)',
    )

  sort = (): PageElement => cy.get('#sort')

  filterCheckbox = (): PageElement => cy.get('.hmpps-side-filter .govuk-checkboxes__item').first().find('input')

  filterApplyButton = (): PageElement => cy.get('[data-qa=apply-filter-button]')

  addAlertButton = (): PageElement => cy.get('#add-alert-action-button a')

  addMoreDetailsLink = (): PageElement => cy.get('[data-qa=add-more-details-link]')

  closeAlertLink = (): PageElement => cy.get('[data-qa=close-alert-link]')

  changeEndDateLink = (): PageElement => cy.get('[data-qa=change-end-date-link]')

  viewAllLink = (): PageElement => cy.get('.hmpps-pagination-view-all a')

  successMessage = (): PageElement => cy.get('.hmpps-flash-message--success > p')

  bannerApiUnavailableBanner = (): PageElement => cy.get('.alerts-list .dps-banner__error')

  pageApiUnavailableBanner = (): PageElement => cy.get('main .dps-banner__error')
}
