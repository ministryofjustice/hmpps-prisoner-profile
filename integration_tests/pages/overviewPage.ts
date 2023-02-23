import Page, { PageElement } from './page'

export default class OverviewPage extends Page {
  constructor() {
    super('Overview')
  }

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
        prisonerName: (): PageElement => row.eq(0),
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
}
