import type { PageElement } from '../page'

export class SummaryList {
  constructor(private readonly selector: string) {}

  get element(): PageElement<HTMLDListElement> {
    return cy.get<HTMLDListElement>(this.selector)
  }

  get rows(): Cypress.Chainable<Row[]> {
    return this.element.find<HTMLDivElement>('div.govuk-summary-list__row').then($div => {
      return $div
        .map((_index, div) => {
          const key = div.getElementsByClassName('govuk-summary-list__key')[0] as HTMLElement
          const value = div.getElementsByClassName('govuk-summary-list__value')[0] as HTMLElement
          const options = div.getElementsByClassName('govuk-summary-list__actions')[0] as HTMLElement
          return {
            key: key?.innerText?.trim(),
            value: value?.innerText?.trim(),
            withOptionsCell(func: (optionsCell: HTMLElement | undefined) => void): void {
              func(options)
            },
          }
        })
        .toArray()
    })
  }
}

export interface Row {
  key: string
  value: string
  withOptionsCell(func: (optionsCell: HTMLElement | undefined) => void): void
}
