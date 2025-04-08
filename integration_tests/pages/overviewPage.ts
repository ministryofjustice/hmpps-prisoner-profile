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

  moneyVisitsNonAssociationsGroup = (): PageElement => cy.get('[data-qa=overview-mini-summary-group-a]')

  moneyVisitsNonAssociationsGroup_MacroHeader = (): PageElement =>
    cy.get('[data-qa=overview-mini-summary-group-a] [data-qa=summary-header]')

  moneyCard = (): PageElement =>
    cy.get('[data-qa=overview-mini-summary-group-a] [data-qa=mini-summary-list-macro] > div:nth-child(1)')

  visitsCard = (): PageElement =>
    cy.get('[data-qa=overview-mini-summary-group-a] [data-qa=mini-summary-list-macro] > div:nth-child(2)')

  nonAssociationsCard = (): PageElement =>
    cy.get('[data-qa=overview-mini-summary-group-a] [data-qa=mini-summary-list-macro] > div:nth-child(3)')

  categoryCsraCsipGroup = (): PageElement => cy.get('[data-qa=overview-mini-summary-group-b]')

  categoryCsraCsipGroup_MacroHeader = (): PageElement =>
    cy.get('[data-qa=overview-mini-summary-group-b] [data-qa=summary-header]')

  categoryCard = (): PageElement =>
    cy.get('[data-qa=overview-mini-summary-group-b] [data-qa=mini-summary-list-macro] > .mini-card--categories')

  adjudicationsSummary = (): PageElement => cy.get('[data-qa=adjudications-summary] > .hmpps-summary-card')

  incentivesCard = (): PageElement => cy.get('.mini-card--incentives')

  csraCard = (): PageElement =>
    cy.get('[data-qa=overview-mini-summary-group-b] [data-qa=mini-summary-list-macro] > .mini-card--csra')

  csipCard = (): PageElement =>
    cy.get('[data-qa=overview-mini-summary-group-b] [data-qa=mini-summary-list-macro] > .mini-card--csip')

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

  personalDetails = () => {
    const card = (): PageElement => cy.getDataQa('personal-details')
    return {
      dateOfBirth: (): PageElement => card().findDataQa('date-of-birth'),
      age: (): PageElement => card().findDataQa('age'),
      nationality: (): PageElement => card().findDataQa('nationality'),
      spokenLanguage: (): PageElement => card().findDataQa('spoken-language'),
      ethnicGroup: (): PageElement => card().findDataQa('ethnic-group'),
      religionOrBelief: (): PageElement => card().findDataQa('religion-or-belief'),
      croNumber: (): PageElement => card().findDataQa('cro-number'),
      pncNumber: (): PageElement => card().findDataQa('pnc-number'),
    }
  }

  externalContacts = () => {
    const card = (): PageElement => cy.get('#external-contacts')
    return {
      card,
      officialHeading: (): PageElement => card().findDataQa('external-contacts-official'),
      official: (): PageElement => card().findDataQa('external-contacts-official-count'),
      socialHeading: (): PageElement => card().findDataQa('external-contacts-social'),
      social: (): PageElement => card().findDataQa('external-contacts-social-count'),
    }
  }

  staffContacts = (): PageElement => cy.get('[data-qa=staff-contacts]')

  primaryPomName = (): PageElement => cy.get('[data-qa=staff-contacts] dd[data-qa=primary-pom-name]')

  secondaryPomName = (): PageElement => cy.get('[data-qa=staff-contacts] dd[data-qa=secondary-pom-name]')

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
  overviewConfirmedReleaseLabel = (): PageElement => cy.get('[data-qa="overview-confirmed-release-label"]')

  overviewConfirmedRelease = (): PageElement => cy.get('[data-qa="overview-confirmed-release"]')

  overviewConditionalReleaseLabel = (): PageElement => cy.get('[data-qa="overview-conditional-release-label"]')

  overviewConditionalRelease = (): PageElement => cy.get('[data-qa="overview-conditional-release"]')

  // On remand
  nextAppearanceDate = (): PageElement => cy.get('[data-qa="overview-next-court-appearance"]')

  // CSRA
  csraWithoutLink = (): PageElement => cy.get('[data-qa="prisoner-csra-info-without-link"]')

  csraWithLink = (): PageElement => cy.get(':nth-child(3) > [data-qa="prisoner-csra-info-with-link"]')

  // Alert Flags
  alertFlags = (): PageElement => cy.get('[data-qa="alert-flags"]')

  alertModal = (): PageElement => cy.get('[data-module="modal"]')

  alertModalBody = (): PageElement => this.alertModal().get('[data-modal-body]')

  alertModalClose = (): PageElement => this.alertModal().get('[data-modal-hide]')

  courtCasesAndReleaseDates = () => ({
    card: (): PageElement => cy.get('[data-qa="court-cases-release-dates"]'),
    courtCasesCount: (): PageElement => cy.get('[data-qa="overview-court-cases-count"]'),
    nextCourtAppearance: () => ({
      caseReference: (): PageElement =>
        cy.get(
          '[data-qa="overview-next-court-appearance"] > .govuk-summary-list > :nth-child(1) > .govuk-summary-list__value',
        ),

      location: (): PageElement =>
        cy.get(
          '[data-qa="overview-next-court-appearance"] > .govuk-summary-list > :nth-child(2) > .govuk-summary-list__value',
        ),

      hearingType: (): PageElement =>
        cy.get(
          '[data-qa="overview-next-court-appearance"] > .govuk-summary-list > :nth-child(3) > .govuk-summary-list__value',
        ),

      date: (): PageElement =>
        cy.get(
          '[data-qa="overview-next-court-appearance"] > .govuk-summary-list > :nth-child(4) > .govuk-summary-list__value',
        ),

      placeHolderText: (): PageElement => cy.get('[data-qa="overview-next-court-appearance"] > :nth-child(2)'),
    }),
    latestCalculation: () => ({
      dateOfCalculation: (): PageElement =>
        cy.get(
          '[data-qa="overview-latest-calculation"] > .govuk-summary-list > :nth-child(1) > .govuk-summary-list__value',
        ),
      establishment: (): PageElement =>
        cy.get(
          '[data-qa="overview-latest-calculation"] > .govuk-summary-list > :nth-child(2) > .govuk-summary-list__value',
        ),
      reason: (): PageElement =>
        cy.get(
          '[data-qa="overview-latest-calculation"] > .govuk-summary-list > :nth-child(3) > .govuk-summary-list__value',
        ),

      placeHolderText: (): PageElement => cy.get('[data-qa="overview-latest-calculation"] > :nth-child(2)'),
    }),
  })
}
