import Page, { PageElement } from './page'

export default class OverviewPage extends Page {
  constructor() {
    super('Overview')
  }

  activeTab = (): PageElement => cy.get('[data-qa=active-tab]')

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  headerChangeLocation = (): PageElement => cy.get('[data-qa=header-change-location]')

  // Common

  header1 = (): PageElement => cy.get('h1')

  header2 = (): PageElement => cy.get('h2')

  header3 = (): PageElement => cy.get('h3')

  // Mini Summary

  miniSummaryGroupA = (): PageElement => cy.get('[data-qa=overview-mini-summary-group-a]')

  miniSummaryGroupA_MacroHeader = (): PageElement =>
    cy.get('[data-qa=overview-mini-summary-group-a] [data-qa=summary-header]')

  moneyCard = (): PageElement =>
    cy.get('[data-qa=overview-mini-summary-group-a] [data-qa=mini-summary-list-macro] > div:nth-child(1)')

  adjudicationsCard = (): PageElement =>
    cy.get('[data-qa=overview-mini-summary-group-a] [data-qa=mini-summary-list-macro] > div:nth-child(2)')

  visitsCard = (): PageElement =>
    cy.get('[data-qa=overview-mini-summary-group-a] [data-qa=mini-summary-list-macro] > div:nth-child(3)')

  miniSummaryGroupB = (): PageElement => cy.get('[data-qa=overview-mini-summary-group-b]')

  miniSummaryGroupB_MacroHeader = (): PageElement =>
    cy.get('[data-qa=overview-mini-summary-group-b] [data-qa=summary-header]')

  categoryCard = (): PageElement =>
    cy.get('[data-qa=overview-mini-summary-group-b] [data-qa=mini-summary-list-macro] > div:nth-child(1)')

  incentivesCard = (): PageElement =>
    cy.get('[data-qa=overview-mini-summary-group-b] [data-qa=mini-summary-list-macro] > div:nth-child(2)')

  csraCard = (): PageElement =>
    cy.get('[data-qa=overview-mini-summary-group-b] [data-qa=mini-summary-list-macro] > div:nth-child(3)')

  // Non Associations

  nonAssociations = () => ({
    table: (): PageElement => cy.get('[data-qa=non-associations-table]'),
    rows: (): PageElement => this.nonAssociations().table().get('tr'),
    row: (rowNumber: number) => {
      const row = this.nonAssociations().table().find('tr').eq(rowNumber).find('th, td')
      return {
        prisonerName: (): PageElement => row.eq(0).find('a'),
        prisonNumber: (): PageElement => row.eq(1),
        location: (): PageElement => row.eq(2),
        reciprocalReason: (): PageElement => row.eq(3),
      }
    },
  })

  personalDetails = (): PageElement => cy.get('[data-qa=personal-details]')

  staffContacts = (): PageElement => cy.get('[data-qa=staff-contacts]')

  schedule = () => ({
    morning: () => ({
      column: (): PageElement => cy.get('[data-qa=morning-schedule]'),
      item: (itemNumber: number): PageElement =>
        this.schedule().morning().column().find('[data-qa=schedule-item]').eq(itemNumber),
    }),
    afternoon: () => ({
      column: (): PageElement => cy.get('[data-qa=afternoon-schedule]'),
      item: (itemNumber: number): PageElement =>
        this.schedule().afternoon().column().find('[data-qa=schedule-item]').eq(itemNumber),
    }),
    evening: () => ({
      column: (): PageElement => cy.get('[data-qa=evening-schedule]'),
      item: (itemNumber: number): PageElement =>
        this.schedule().evening().column().find('[data-qa=schedule-item]').eq(itemNumber),
    }),
  })

  prisonerPhotoLink = (): PageElement => cy.get('[data-qa=prisoner-photo-link]')

  // Statuses

  statusList = (): PageElement => cy.get('.hmpps-status-list')

  // Actions

  addCaseNoteActionLink = (): PageElement => cy.get('[data-qa=add-case-note-action-link]')

  calculateReleaseDatesActionLink = (): PageElement => cy.get('[data-qa=calculate-release-dates-action-link]')

  addAppointmentActionLink = (): PageElement => cy.get('[data-qa=add-appointment-action-link]')

  reportUseOfForceActionLink = (): PageElement => cy.get('[data-qa=report-use-of-force-action-link]')

  referToPathfinderActionLink = (): PageElement => cy.get('[data-qa=refer-to-pathfinder-action-link]')

  addToSocActionLink = (): PageElement => cy.get('[data-qa=add-to-soc-action-link]')

  manageCategoryActionLink = (): PageElement => cy.get('[data-qa=manage-category-action-link]')

  addKeyWorkerSessionActionLink = (): PageElement => cy.getDataQa('add-key-worker-session-action-link')

  // More Info

  probationDocumentsInfoLink = (): PageElement => cy.get('[data-qa=probation-documents-info-link]')

  pathfinderProfileInfoLink = (): PageElement => cy.get('[data-qa=pathfinder-profile-info-link]')

  socProfileInfoLink = (): PageElement => cy.get('[data-qa=soc-profile-info-link]')

  // Offences

  offencesHeader = (): PageElement =>
    cy.get('[data-qa="overview-offences"] > .hmpps-summary-card > [data-qa="summary-header"]')

  offenceCardContent = (): PageElement =>
    cy.get(
      '[data-qa="overview-offences"] > .hmpps-summary-card > .hmpps-summary-card__body > .govuk-grid-row > .govuk-grid-column-full',
    )

  mainOffence = (): PageElement => cy.get('[data-qa="overview-main-offence"]')

  imprisonmentStatusLabel = (): PageElement =>
    cy.get(
      '[data-qa="overview-offences"] > .hmpps-summary-card > .hmpps-summary-card__body > .govuk-grid-row > .govuk-grid-column-full > :nth-child(4)',
    )

  imprisonmentStatus = (): PageElement =>
    cy.get(
      '[data-qa="overview-offences"] > .hmpps-summary-card > .hmpps-summary-card__body > .govuk-grid-row > .govuk-grid-column-full > :nth-child(5)',
    )

  viewAllOffencesLink = (): PageElement => cy.get('[data-qa="overview-offences-view-all"]')

  // Not on remand
  overviewConditionalReleaseLabel = (): PageElement => cy.get('[data-qa="overview-conditional-release-label"]')

  overviewConditionalRelease = (): PageElement => cy.get('[data-qa="overview-conditional-release"]')

  // On remand
  nextAppearanceDate = (): PageElement => cy.get('[data-qa="overview-next-court-appearance"]')

  // CSRA
  csraWithoutLink = (): PageElement => cy.get('[data-qa="prisoner-csra-info-without-link"]')

  csraWithLink = (): PageElement => cy.get(':nth-child(3) > [data-qa="prisoner-csra-info-with-link"]')

  // Alerts summary
  alertsSummary = () => ({
    panel: (): PageElement => cy.get('[data-qa=overview-alerts-summary]'),
    alertCount: (): PageElement => this.alertsSummary().panel().get('[data-qa=overview-active-alerts]'),
    nonAssociationCount: (): PageElement =>
      this.alertsSummary().panel().get('[data-qa=overview-non-association-count]'),
  })
}
