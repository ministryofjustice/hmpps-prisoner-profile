import Page, { type PageElement } from './page'

export default class XrayBodyScans extends Page {
  constructor(possessivePrisonerName: string) {
    super(`${possessivePrisonerName} X-ray body scans`)
  }

  get mixedScansNote(): PageElement<HTMLParagraphElement> {
    return cy.getDataQa('mixed-scans-note')
  }

  get alert(): PageElement<HTMLDivElement> {
    return cy.get('.moj-alert')
  }

  get bodyScansTable(): PageElement<HTMLTableElement> {
    return cy.get('.govuk-table')
  }

  get bodyScansHistory(): Cypress.Chainable<{ date: string; comments: string }[]> {
    return this.bodyScansTable.find<HTMLTableRowElement>('tbody tr').then($rows =>
      $rows
        .map((_index, row) => ({
          date: row.querySelector('td:first-child').textContent.trim(),
          comments: row.querySelector('td:last-child').textContent.trim(),
        }))
        .toArray(),
    )
  }
}
