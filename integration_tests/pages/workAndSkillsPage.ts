import Page, { PageElement } from './page'

export default class WorkAndSkillsPage extends Page {
  constructor() {
    super('Work and skills')
  }

  activeTab = (): PageElement => cy.get('[data-qa=active-tab]')

  headerUserName = (): PageElement => cy.get('[data-qa=header-user-name]')

  headerChangeLocation = (): PageElement => cy.get('[data-qa=header-change-location]')

  // Common
  header1 = (): PageElement => cy.get('h1')

  header2 = (): PageElement => cy.get('h2')

  header3 = (): PageElement => cy.get('h3')

  prisonerPhotoLink = (): PageElement => cy.get('[data-qa=prisoner-photo-link]')

  sidebar = (): PageElement => cy.get('.hmpps-sidebar')

  main = (): PageElement => cy.get('#main-content > :nth-child(3)')

  // CAQ = Courses and Qualifications card
  CAQ_card = (): PageElement => cy.get('#courses-and-qualifications')

  CAQ_header = (): PageElement => cy.get('#courses-and-qualifications > [data-qa="summary-header"] > h2')

  CAQ_info = (): PageElement => cy.get('#courses-and-qualifications > .hmpps-summary-card__body > :nth-child(1)')

  CAQ_courses = (): PageElement => cy.get('#courses-and-qualifications > .hmpps-summary-card__body > .govuk-heading-s')

  CAQ_listKey = (): PageElement =>
    cy.get(
      '#courses-and-qualifications > .hmpps-summary-card__body > .govuk-summary-list > .govuk-summary-list__row > .govuk-summary-list__key',
    )

  CAQ_listValue = (): PageElement =>
    cy.get(
      '#courses-and-qualifications > .hmpps-summary-card__body > .govuk-summary-list > .govuk-summary-list__row > .govuk-summary-list__value',
    )

  CAQ_viewHistory = (): PageElement =>
    cy.get('#courses-and-qualifications > .hmpps-summary-card__body > .govuk-body > .govuk-link--no-visited-state')

  // WAA = Work and activities card
  workAndActivities = () => {
    const cardData = dataQa => cy.get('[data-qa=work-and-activities]').findDataQa(dataQa)
    return {
      currentActivities: (activityNumber: number) => ({
        activity: () =>
          cardData('current-activities')
            .find('.govuk-summary-list__row')
            .eq(activityNumber)
            .find('.govuk-summary-list__key'),
        started: () =>
          cardData('current-activities')
            .find('.govuk-summary-list__row')
            .eq(activityNumber)
            .find('.govuk-summary-list__value'),
      }),
      unacceptableAbsenceLastMonth: () => cardData('unacceptable-absence-last-month'),
      unacceptableAbsenceLast6Months: () => cardData('unacceptable-absence-last-six-months'),
      emptyMessage: () => cardData('no-work-or-activities'),
    }
  }

  // ES = Employability skills card
  ES_card = (): PageElement => cy.get('#employability-skills')

  ES_header = (): PageElement => cy.get('#employability-skills > [data-qa="summary-header"] > h2')

  ES_heading = (): PageElement => cy.get('#employability-skills > .hmpps-summary-card__body > .govuk-heading-s')

  ES_info = (): PageElement => cy.get('#employability-skills > .hmpps-summary-card__body > p')

  ES_skillOne = (): PageElement => cy.get('.govuk-grid-column-one-third > .govuk-body')

  ES_skillLevelOne = (): PageElement => cy.get('.govuk-grid-column-two-thirds > p')

  // Goals card
  GoalsInfo = (): PageElement => cy.get('[data-qa="goals-info-text"]')

  PlpGoalsSummary = (): PageElement => cy.getDataQa('plp-goals')

  Vc2GoalsSummary = (): PageElement => cy.getDataQa('vc2-goals')

  PlpVc2GoalsSummary = (): PageElement => cy.getDataQa('plp-vc2-goals')

  NoGoalsSummary = (): PageElement => cy.getDataQa('no-goals')

  ProblemRetrievingGoals = (): PageElement => cy.getDataQa('problem-retrieving-goals')

  // FSL = Functional skills level
  FSL_card = (): PageElement => cy.get('#functional-skills-level')

  FSL_header = (): PageElement => cy.get('#functional-skills-level > [data-qa="summary-header"] > h2')

  FSL_listKey = (): PageElement => cy.get(':nth-child(2) > :nth-child(1) > .govuk-summary-list__key')

  FSL_listValue = (): PageElement => cy.get(':nth-child(2) > :nth-child(1) > .govuk-summary-list__value')

  FSL_listKey2 = (): PageElement => cy.get(':nth-child(2) > :nth-child(2) > .govuk-summary-list__key')

  FSL_listValue2 = (): PageElement => cy.get(':nth-child(2) > :nth-child(2) > .govuk-summary-list__value')

  FSL_listKey3 = (): PageElement => cy.get(':nth-child(2) > :nth-child(3) > .govuk-summary-list__key')

  FSL_listValue3 = (): PageElement => cy.get(':nth-child(2) > :nth-child(3) > .govuk-summary-list__value')

  FSL_listKey4 = (): PageElement =>
    cy.get(
      '#functional-skills-level > .hmpps-summary-card__body > :nth-child(4) > :nth-child(1) > .govuk-summary-list__key',
    )

  FSL_listValue4 = (): PageElement =>
    cy.get(
      '#functional-skills-level > .hmpps-summary-card__body > :nth-child(4) > :nth-child(1) > .govuk-summary-list__value',
    )

  FSL_listKey5 = (): PageElement =>
    cy.get(
      '#functional-skills-level > .hmpps-summary-card__body > :nth-child(4) > :nth-child(2) > .govuk-summary-list__key',
    )

  FSL_listValue5 = (): PageElement =>
    cy.get(
      '#functional-skills-level > .hmpps-summary-card__body > :nth-child(4) > :nth-child(2) > .govuk-summary-list__value',
    )

  FSL_listKey6 = (): PageElement =>
    cy.get(
      '#functional-skills-level > .hmpps-summary-card__body > :nth-child(4) > :nth-child(3) > .govuk-summary-list__key',
    )

  FSL_listValue6 = (): PageElement =>
    cy.get(
      '#functional-skills-level > .hmpps-summary-card__body > :nth-child(4) > :nth-child(3) > .govuk-summary-list__value',
    )
}
