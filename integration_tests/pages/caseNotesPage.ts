import Page, { type PageElement } from './page'
import PagedList from './pageElements/pagedList'

export default class CaseNotesPage extends Page {
  h1 = (): PageElement => cy.get('h1')

  caseNotesList = (): PageElement => cy.get('.hmpps-case-note-card-list')

  caseNotesListItem = (): PageElement => cy.get('.hmpps-case-note-card-list .hmpps-case-note-card-list-item')

  caseNotesEmptyState = (): PageElement => cy.getDataQa('case-notes-empty-state')

  public pagedList = new PagedList()

  sort = (): PageElement => cy.get('#sort')

  filterType = (): PageElement => cy.get('#type')

  filterApplyButton = (): PageElement => cy.getDataQa('apply-filter-button')

  addCaseNoteButton = (): PageElement => cy.get('#add-case-note-action-button a')

  addMoreDetailsButton = (): PageElement => cy.getDataQa('case-notes-add-more-details-link')

  filterDateFromLabel = (): PageElement => cy.get(':nth-child(3) > div > .govuk-label')

  filterDateToLabel = (): PageElement => cy.get(':nth-child(4) > div > .govuk-label')

  warningPrintSlip = (): PageElement => cy.getDataQa('print-slip-warning')

  encouragementPrintSlip = (): PageElement => cy.getDataQa('print-slip-encouragement')

  apiUnavailableBanner = (): PageElement => cy.get('.dps-banner__error')
}
