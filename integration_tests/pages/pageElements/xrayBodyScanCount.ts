import type { PageElement } from '../page'

export default class XrayBodyScanCount {
  constructor(private readonly selector: string) {}

  private get container(): PageElement<HTMLDivElement> {
    return cy.get(this.selector)
  }

  shouldDisplayCountOf(count: number): Cypress.Chainable<unknown> {
    return this.container.find('.xray-body-scan-count__number').find('span').eq(0).should('contain.text', count)
  }

  private get warningContainer(): PageElement<HTMLDivElement> {
    return this.container.find('.xray-body-scan-count__limit-warning')
  }

  shouldIndicate(limit: 'nearing limit', remainingCount: number): Cypress.Chainable<unknown>

  shouldIndicate(limit: 'not near limit' | 'at limit'): Cypress.Chainable<unknown>

  shouldIndicate(
    limit: 'not near limit' | 'nearing limit' | 'at limit',
    remainingCount?: number,
  ): Cypress.Chainable<unknown> {
    if (limit === 'not near limit') {
      return this.warningContainer.should('not.exist')
    }

    if (limit === 'nearing limit') {
      this.warningContainer.should('contain.text', 'Near scan limit')
      this.warningContainer.should('not.contain.text', 'Scan limit reached')
      return this.container.should('contain.text', `${remainingCount} scans left this year`)
    }

    this.warningContainer.should('not.contain.text', 'Near scan limit')
    return this.warningContainer.should('contain.text', 'Scan limit reached')
  }
}
