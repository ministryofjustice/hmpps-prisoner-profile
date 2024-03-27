import { PageElement } from '../page'

export default class HmppsPagination {
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

  viewAllLink = (): PageElement => cy.get('.hmpps-pagination-view-all a')
}
