import Page, { PageElement } from './page'

export default class IncentiveLevelDetailsPage extends Page {
  currentIncentiveLevel = (): PageElement => cy.get('[data-test=current-incentive-level]')

  recordIncentiveLevelButton = (): PageElement => cy.get('[data-qa=record-incentive-level-button]')

  nextReviewDate = (): PageElement => cy.get('[data-test=next-review-date]')

  nextReviewDateOverdue = (): PageElement => cy.get('[data-test=next-review-overdue]')

  incentivesFilter = (): PageElement => cy.get('[data-test=incentives-filter]')

  incentiveLevelHistoryTable = (): PageElement => cy.get('[data-test=incentive-level-history]')

  noIncentivesMessage = (): PageElement => cy.get('[data-test=no-incentive-level-history-message]')
}
