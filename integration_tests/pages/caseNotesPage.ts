import Page, { PageElement } from './page'

export default class CaseNotesPage extends Page {
  h1 = (): PageElement => cy.get('h1')

  caseNotesList = (): PageElement => cy.get('.hmpps-case-note-card-list')

  caseNotesListItem = (): PageElement => cy.get('.hmpps-case-note-card-list .hmpps-case-note-card-list-item')

  caseNotesEmptyState = (): PageElement => cy.get('[data-qa=case-notes-empty-state]')

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

  filterType = (): PageElement => cy.get('#type')

  filterApplyButton = (): PageElement => cy.get('[data-qa=apply-filter-button]')

  addCaseNoteButton = (): PageElement => cy.get('#add-case-note-action-button a')

  viewAllLink = (): PageElement => cy.get('.hmpps-pagination-view-all a')
}
