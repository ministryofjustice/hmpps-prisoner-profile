import Page, { PageElement } from './page'

export default class OffencesPage extends Page {
  constructor() {
    super('Offences')
  }

  activeTab = (): PageElement => cy.get('[data-qa=active-tab]')

  sidebar = (): PageElement => cy.get('.hmpps-sidebar')

  courtCasesAndOffencesCard = (): PageElement => cy.get('#court-cases-sentence-details')

  courtCasesAndOffencesHeader = (): PageElement =>
    cy.get('#court-cases-sentence-details > [data-qa="summary-header"] > h2')

  showAllText = (): PageElement => cy.get('.govuk-accordion__show-all-text')

  sectionHeading = (): PageElement => cy.get('.govuk-accordion__section-heading-text-focus')

  sectionSummary = (): PageElement => cy.get('.govuk-accordion__section-summary-focus')

  sectionToggleText = (): PageElement => cy.get('.govuk-accordion__section-toggle-text')

  sectionSumaryOffences = (): PageElement => cy.get('#accordion-with-summary-sections-content-1 > :nth-child(1)')

  offencesChildOne = (): PageElement =>
    cy.get(':nth-child(1) > .govuk-grid-column-full > .govuk-!-static-margin-bottom-5 > .govuk-!-font-weight-bold')

  offencesChildTwo = (): PageElement =>
    cy.get('#accordion-with-summary-sections-content-1 > .govuk-list > :nth-child(2)')

  offencesChildThree = (): PageElement =>
    cy.get('#accordion-with-summary-sections-content-1 > .govuk-list > :nth-child(3)')

  sectionSummarySentences = (): PageElement => cy.get('#accordion-with-summary-sections-content-1 > :nth-child(3)')

  countOffenceCard = (): PageElement =>
    cy.get('#accordion-with-summary-sections-content-1 > :nth-child(1) > .govuk-grid-column-full')

  releaseDatesCard = (): PageElement => cy.get('#release-dates')

  releaseDatesSummaryHeader = (): PageElement => cy.get('#release-dates > [data-qa="summary-header"] > h2')

  conditionalReleaseKey = (): PageElement =>
    cy.get('.hmpps-summary-card__body > .govuk-summary-list > :nth-child(1) > .govuk-summary-list__key')

  conditionalReleaseValue = (): PageElement =>
    cy.get('.hmpps-summary-card__body > .govuk-summary-list > :nth-child(1) > .govuk-summary-list__value')

  postRecallKey = (): PageElement =>
    cy.get('.hmpps-summary-card__body > .govuk-summary-list > :nth-child(5) > .govuk-summary-list__key')

  postRecallValue = (): PageElement =>
    cy.get('.hmpps-summary-card__body > .govuk-summary-list > :nth-child(5) > .govuk-summary-list__value')

  detentionPostRecallReleaseDateKey = (): PageElement =>
    cy.get('.hmpps-summary-card__body > .govuk-summary-list > :nth-child(2) > .govuk-summary-list__key')

  detentionPostRecallReleaseDateValue = (): PageElement =>
    cy.get('.hmpps-summary-card__body > .govuk-summary-list > :nth-child(2) > .govuk-summary-list__value')

  effectiveSentenceEndDateKey = (): PageElement =>
    cy.get('.hmpps-summary-card__body > .govuk-summary-list > :nth-child(3) > .govuk-summary-list__key')

  effectiveSentenceEndDateValue = (): PageElement =>
    cy.get('.hmpps-summary-card__body > .govuk-summary-list > :nth-child(3) > .govuk-summary-list__value')

  paroleEligibilityKey = (): PageElement =>
    cy.get('.hmpps-summary-card__body > .govuk-summary-list > :nth-child(4) > .govuk-summary-list__key')

  paroleEligibilityValue = (): PageElement =>
    cy.get('.hmpps-summary-card__body > .govuk-summary-list > :nth-child(4) > .govuk-summary-list__value')

  countFiveCard = (): PageElement =>
    cy.get('#accordion-with-summary-sections-content-3 > :nth-child(3) > .govuk-grid-column-full')

  lifeSentenceOffenceCard = (): PageElement =>
    cy.get('#accordion-with-summary-sections-content-2 > :nth-child(1) > .govuk-grid-column-full')
}
