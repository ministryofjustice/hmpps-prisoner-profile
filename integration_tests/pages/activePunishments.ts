import Page, { PageElement } from './page'

export default class ActivePunishmentsPage extends Page {
  constructor() {
    super('John Saunders’ active punishments')
  }

  h1 = (): PageElement => cy.get('h1')

  punishmentTypeLabel = (): PageElement => cy.get('[data-qa="active-punishment-type-label"]')

  detailsCommentLabel = (): PageElement => cy.get('[data-qa="active-punishment-details-label"]')

  startDateLabel = (): PageElement => cy.get('[data-qa="active-punishment-start-date-label"]')

  firstRowPunishmentType = (): PageElement => cy.get('.govuk-table__body > .govuk-table__row > :nth-child(1)')

  firstRowDetailsComment = (): PageElement => cy.get('.govuk-table__body > .govuk-table__row > :nth-child(2)')

  firstRowStartDate = (): PageElement => cy.get('.govuk-table__body > .govuk-table__row > :nth-child(3)')

  viewHistoryLink = (): PageElement => cy.get('[data-qa="active-punishment-view-history"]')
}
