import Page, { PageElement } from './page'

export default class ProbationDocumentsPage extends Page {
  constructor() {
    super('Documents held by probation')
  }

  documentsTable = (table: () => PageElement, row: number) => {
    const tableRow = () => table().find('tbody').find('.govuk-table__row').eq(row)
    const details = () => tableRow().find('.govuk-table__cell').eq(0)
    return {
      details: () => ({
        documentLink: () => details().find('.govuk-grid-column-full').eq(0).find('a'),
        documentTypeAndAuthor: () => details().find('.govuk-grid-column-full').eq(1),
        documentDescription: () => details().find('.govuk-grid-column-full').eq(2),
      }),
      date: () => tableRow().find('.govuk-table__cell').eq(1),
    }
  }

  errors = () => cy.get('[data-module="govuk-error-summary"]')

  generalDocuments = (row: number) => {
    const table = () => cy.get('.govuk-table').eq(0)
    return this.documentsTable(table, row)
  }

  sentenceDocuments = () => {
    const sentence = row => cy.get('.govuk-accordion__section').eq(row)
    return {
      expandAll: () => cy.get('.govuk-accordion__show-all').click(),
      sentence: (row: number) => {
        const selected = () => sentence(row)
        return {
          title: () => selected().find('.govuk-accordion__section-heading-text'),
          description: () => selected().find('.govuk-accordion__section-summary'),
          documents: (documentRow: number) => this.documentsTable(() => selected().find('.govuk-table'), documentRow),
        }
      },
    }
  }
}
