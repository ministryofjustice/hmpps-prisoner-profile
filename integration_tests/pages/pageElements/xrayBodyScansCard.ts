import type { PageElement } from '../page'
import XrayBodyScanCount from './xrayBodyScanCount'

export default class XrayBodyScansCard {
  constructor(private readonly selector: string) {}

  get container(): PageElement<HTMLDivElement> {
    return cy.get(this.selector)
  }

  get cardActions(): PageElement<HTMLUListElement> {
    return this.container.find('.hmpps-summary-card__actions')
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

  private get noScansNote(): PageElement<HTMLParagraphElement> {
    return this.container.find('p[data-qa="xray-body-scan-card__no-scans"]')
  }

  shouldShowLatestScan(date: string, outcome: string): Cypress.Chainable<unknown> {
    this.latestScanDate.should('contain.text', date)
    this.latestScanOutcome.should('contain.text', outcome)
    return this.noScansNote.should('not.exist')
  }

  shouldShowNoScans(): Cypress.Chainable<unknown> {
    this.latestScanDate.should('not.exist')
    this.latestScanOutcome.should('not.exist')
    return this.noScansNote.should('contain.text', 'No scans recorded')
  }

  get historyLink(): PageElement<HTMLAnchorElement> {
    return this.container.find('a').contains('Check body scan details')
  }

  shouldShowSummaryIsUnavailable(): Cypress.Chainable<unknown> {
    return this.container.find('[data-qa="xray-body-scan-card--summary-unavailable"]').should('exist')
  }

  shouldShowLatestScanIsUnavailable(): Cypress.Chainable<unknown> {
    return this.container.find('[data-qa="xray-body-scan-card--latest-unavailable"]').should('exist')
  }
}
