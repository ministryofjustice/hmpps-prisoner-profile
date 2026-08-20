import type { PageElement } from '../page'
import XrayBodyScanCount from './xrayBodyScanCount'

export default class XrayBodyScansCard {
  constructor(private readonly selector: string) {}

  get container(): PageElement<HTMLDivElement> {
    return cy.get(this.selector)
  }

  get scanCount(): XrayBodyScanCount {
    return new XrayBodyScanCount('.xray-body-scan-count')
  }

  get legacyDataNote(): PageElement<HTMLParagraphElement> {
    return this.container.find('p.hmpps-secondary-text')
  }

  private get latestScanDate(): PageElement<HTMLParagraphElement> {
    return this.container.find('p[data-qa="xray-body-scan-card__latest-date"]')
  }

  private get latestScanOutcome(): PageElement<HTMLParagraphElement> {
    return this.container.find('p[data-qa="xray-body-scan-card__latest-outcome"]')
  }

  shouldShowLatestScan(date: string, outcome: string | null): Cypress.Chainable<unknown> {
    this.latestScanDate.should('contain.text', date)
    if (outcome === null) {
      return this.latestScanOutcome.should('not.exist')
    }
    return this.latestScanOutcome.should('contain.text', outcome)
  }

  shouldShowNoScans(): Cypress.Chainable<unknown> {
    this.latestScanDate.should('not.exist')
    return this.latestScanOutcome.should('not.exist')
  }

  get historyLink(): PageElement<HTMLAnchorElement> {
    return this.container.find('a').contains('Check body scan details')
  }

  get recordLink(): PageElement<HTMLAnchorElement> {
    return this.container.find('a').contains('Record a new scan')
  }

  shouldShowSummaryIsUnavailable(): Cypress.Chainable<unknown> {
    return this.container.find('[data-qa="xray-body-scan-card--summary-unavailable"]').should('exist')
  }

  shouldShowLatestScanIsUnavailable(): Cypress.Chainable<unknown> {
    return this.container.find('[data-qa="xray-body-scan-card--latest-unavailable"]').should('exist')
  }
}
