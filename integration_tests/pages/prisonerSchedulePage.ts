import Page, { PageElement } from './page'

export default class PrisonerSchedulePage extends Page {
  constructor() {
    super('John Saunders’ schedule')
  }

  h1 = (): PageElement => cy.get('h1')

  scheduleDates = (): PageElement => cy.get('[data-test="schedule-dates"]')

  scheduleSelectWeek = (): PageElement => cy.get('[data-test="schedule-select-week"]')

  firstActivity = (): PageElement => cy.get(':nth-child(5) > .govuk-heading-m')

  morning = (): PageElement =>
    cy.get(':nth-child(5) > .prisoner-schedule__periods > [data-test="schedule-period"] > .govuk-heading-s')

  afternoon = (): PageElement =>
    cy.get(':nth-child(5) > .prisoner-schedule__periods > :nth-child(2) > .govuk-heading-s')

  evening = (): PageElement => cy.get(':nth-child(9) > .prisoner-schedule__periods > :nth-child(3) > .govuk-heading-s')

  nothingScheduled = (): PageElement =>
    cy.get(
      ':nth-child(5) > .prisoner-schedule__periods > [data-test="schedule-period"] > [data-test="schedule-morning-events"] > .govuk-body',
    )
}
