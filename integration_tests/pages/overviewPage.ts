import Page, { PageElement } from './page'

export default class OverviewPage extends Page {
  constructor() {
    super('Overview')
  }

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  headerChangeLocation = (): PageElement => cy.get('[data-qa=header-change-location]')

  miniSummaryListMacro = (): PageElement => cy.get('[data-qa=mini-summary-list-macro]')

  miniSummaryGroupA = (): PageElement => cy.get('[data-qa=overview-mini-summary-group-a]')

  miniSummaryGroupA_MacroHeader = (): PageElement =>
    cy.get('[data-qa=overview-mini-summary-group-a] [data-qa=summary-header]')

  miniSummaryGroupB = (): PageElement => cy.get('[data-qa=overview-mini-summary-group-b]')

  miniSummaryGroupB_MacroHeader = (): PageElement =>
    cy.get('[data-qa=overview-mini-summary-group-b] [data-qa=summary-header]')

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
}
