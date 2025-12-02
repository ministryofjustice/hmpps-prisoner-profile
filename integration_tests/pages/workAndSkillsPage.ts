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

  CAQ_course_table = (): PageElement => cy.get('#completed-in-prison-courses-in-last-12-months-table')

  CAQ_completed_course_names = (): PageElement => cy.get('[data-qa=completed-course-name]')

  CAQ_no_in_prison_courses_message = (): PageElement => cy.get('[data-qa=no-in-prison-courses-message]')

  CAQ_no_completed_in_prison_courses_message = (): PageElement =>
    cy.get('[data-qa=no-completed-in-prison-courses-message]')

  CAQ_no_completed_in_prison_courses_in_last_12_months_message = (): PageElement =>
    cy.get('[data-qa=no-completed-in-prison-courses-in-last-12-months-message]')

  CAQ_view_all_in_prison_courses_link = (): PageElement => cy.get('[data-qa=link-to-view-all-in-prison-courses]')

  CAQ_curious_unavailable_message = (): PageElement =>
    cy.get('#courses-and-qualifications [data-qa=curious-unavailable-message]')

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

  ES_curious_unavailable_message = (): PageElement =>
    cy.get('#employability-skills [data-qa=curious-unavailable-message]')

  // Goals card
  GoalsInfo = (): PageElement => cy.get('[data-qa="goals-info-text"]')

  LwpGoalsSummary = (): PageElement => cy.getDataQa('lwp-goals')

  Vc2GoalsSummary = (): PageElement => cy.getDataQa('vc2-goals')

  LwpVc2GoalsSummary = (): PageElement => cy.getDataQa('lwp-vc2-goals')

  NoGoalsSummary = (): PageElement => cy.getDataQa('no-goals')

  ProblemRetrievingGoals = (): PageElement => cy.getDataQa('problem-retrieving-goals')

  // FSL = Functional skills level
  FSL_card = (): PageElement => cy.get('#functional-skills-level')

  FSL_header = (): PageElement => cy.get('#functional-skills-level > [data-qa="summary-header"] > h2')

  FSL_results = (): PageElement => this.FSL_card().find('section[data-qa=functional-skills-assessment-results]')

  FSL_result = (idx: number): PageElement => this.FSL_results().find('dl.govuk-summary-list').eq(idx)

  FSL_curious_unavailable_message = (): PageElement =>
    cy.get('#functional-skills-level [data-qa=curious-unavailable-message]')
}
