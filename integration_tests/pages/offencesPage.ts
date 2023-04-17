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
    cy.get('#accordion-with-summary-sections-content-1 > .govuk-list > :nth-child(1)')

  offencesChildTwo = (): PageElement =>
    cy.get('#accordion-with-summary-sections-content-1 > .govuk-list > :nth-child(2)')

  offencesChildThree = (): PageElement =>
    cy.get('#accordion-with-summary-sections-content-1 > .govuk-list > :nth-child(3)')

  sectionSummarySentences = (): PageElement => cy.get('#accordion-with-summary-sections-content-1 > :nth-child(3)')

  sentenceHeadingOne = (): PageElement => cy.get('#accordion-with-summary-sections-content-1 > :nth-child(4)')

  sentenceOneTypeKey = (): PageElement =>
    cy.get(':nth-child(5) > .govuk-grid-column-full > .govuk-summary-list > :nth-child(1) > .govuk-summary-list__key')

  sentenceOneTypeValue = (): PageElement =>
    cy.get(':nth-child(5) > .govuk-grid-column-full > .govuk-summary-list > :nth-child(1) > .govuk-summary-list__value')

  sentenceOneStartDateKey = (): PageElement =>
    cy.get(':nth-child(5) > .govuk-grid-column-full > .govuk-summary-list > :nth-child(2) > .govuk-summary-list__key')

  sentenceOneStartDateValue = (): PageElement =>
    cy.get(':nth-child(5) > .govuk-grid-column-full > .govuk-summary-list > :nth-child(2) > .govuk-summary-list__value')

  sentenceOneLengthKey = (): PageElement =>
    cy.get(':nth-child(5) > .govuk-grid-column-full > .govuk-summary-list > :nth-child(3) > .govuk-summary-list__key')

  sentenceOneLengthValue = (): PageElement =>
    cy.get(':nth-child(5) > .govuk-grid-column-full > .govuk-summary-list > :nth-child(3) > .govuk-summary-list__value')

  sentenceOneLicenceKey = (): PageElement =>
    cy.get(':nth-child(5) > .govuk-grid-column-full > .govuk-summary-list > :nth-child(4) > .govuk-summary-list__key')

  sentenceOneLicenceValue = (): PageElement =>
    cy.get(':nth-child(5) > .govuk-grid-column-full > .govuk-summary-list > :nth-child(4) > .govuk-summary-list__value')

  sentenceHeadingTwo = (): PageElement => cy.get('#accordion-with-summary-sections-content-1 > :nth-child(6)')

  sentenceTwoTypeKey = (): PageElement =>
    cy.get(':nth-child(7) > .govuk-grid-column-full > .govuk-summary-list > :nth-child(1) > .govuk-summary-list__key')

  sentenceTwoTypeValue = (): PageElement =>
    cy.get(':nth-child(7) > .govuk-grid-column-full > .govuk-summary-list > :nth-child(1) > .govuk-summary-list__value')

  sentenceTwoStartDateKey = (): PageElement =>
    cy.get(':nth-child(7) > .govuk-grid-column-full > .govuk-summary-list > :nth-child(2) > .govuk-summary-list__key')

  sentenceTwoStartDateValue = (): PageElement =>
    cy.get(':nth-child(7) > .govuk-grid-column-full > .govuk-summary-list > :nth-child(2) > .govuk-summary-list__value')

  sentenceTwoLengthKey = (): PageElement =>
    cy.get(':nth-child(7) > .govuk-grid-column-full > .govuk-summary-list > :nth-child(3) > .govuk-summary-list__key')

  sentenceTwoLengthValue = (): PageElement =>
    cy.get(':nth-child(7) > .govuk-grid-column-full > .govuk-summary-list > :nth-child(3) > .govuk-summary-list__value')

  sentenceTwoFineKey = (): PageElement =>
    cy.get(':nth-child(7) > .govuk-grid-column-full > .govuk-summary-list > :nth-child(4) > .govuk-summary-list__key')

  sentenceTwoFineValue = (): PageElement =>
    cy.get(':nth-child(7) > .govuk-grid-column-full > .govuk-summary-list > :nth-child(4) > .govuk-summary-list__value')

  releaseDatesCard = (): PageElement => cy.get('#release-dates')

  releaseDatesSummaryHeader = (): PageElement => cy.get('#release-dates > [data-qa="summary-header"] > h2')

  conditionalReleaseKey = (): PageElement =>
    cy.get('.hmpps-summary-card__body > .govuk-summary-list > :nth-child(1) > .govuk-summary-list__key')

  conditionalReleaseValue = (): PageElement =>
    cy.get('.hmpps-summary-card__body > .govuk-summary-list > :nth-child(1) > .govuk-summary-list__value')

  postRecallKey = (): PageElement =>
    cy.get('.hmpps-summary-card__body > .govuk-summary-list > :nth-child(2) > .govuk-summary-list__key')

  postRecallValue = (): PageElement =>
    cy.get('.hmpps-summary-card__body > .govuk-summary-list > :nth-child(2) > .govuk-summary-list__value')

  paroleEligibilityKey = (): PageElement =>
    cy.get('.hmpps-summary-card__body > .govuk-summary-list > :nth-child(3) > .govuk-summary-list__key')

  paroleEligibilityValue = (): PageElement =>
    cy.get('.hmpps-summary-card__body > .govuk-summary-list > :nth-child(3) > .govuk-summary-list__value')

  licenseExpiryKey = (): PageElement =>
    cy.get('.hmpps-summary-card__body > .govuk-summary-list > :nth-child(4) > .govuk-summary-list__key')

  licenseExpiryValue = (): PageElement =>
    cy.get('.hmpps-summary-card__body > .govuk-summary-list > :nth-child(4) > .govuk-summary-list__value')

  sentenceExpiryKey = (): PageElement => cy.get(':nth-child(5) > .govuk-summary-list__key')

  sentenceExpiryValue = (): PageElement => cy.get(':nth-child(5) > .govuk-summary-list__value')
}
