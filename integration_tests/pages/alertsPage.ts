import Page, { PageElement } from './page'

export default class AlertsPage extends Page {
  h1 = (): PageElement => cy.get('h1')

  selectedTab = (): PageElement => cy.get('.govuk-tabs__list-item.govuk-tabs__list-item--selected')

  alertsList = (): PageElement => cy.get('.hmpps-alert-card-list')

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
}
