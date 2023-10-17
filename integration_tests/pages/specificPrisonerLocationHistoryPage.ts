import Page, { PageElement } from './page'

export default class SpecificPrisonerLocationHistoryPage extends Page {
  pageTitle = (): PageElement => cy.get('h1')

  location = () => cy.getDataQa('cell-location')

  movedIn = () => cy.getDataQa('cell-moved-in')

  movedOut = () => cy.getDataQa('cell-moved-out')

  cellType = () => cy.getDataQa('cell-type')

  movedBy = () => cy.getDataQa('cell-moved-by')

  reasonForMove = () => cy.getDataQa('cell-reason-for-move')

  whatHappened = () => cy.getDataQa('cell-what-happened')

  notSharedLocationNotice = () => cy.getDataQa('no-history-message')

  sharedWith = (row: number) => {
    const table = () => cy.get('.govuk-table')
    const tableRow = () => table().find('tbody').find('.govuk-table__row').eq(row)
    return {
      name: () => tableRow().find('td').eq(0),
      prisonNumber: () => tableRow().find('td').eq(1),
      movedIn: () => tableRow().find('td').eq(2),
      movedOut: () => tableRow().find('td').eq(3),
    }
  }
}
