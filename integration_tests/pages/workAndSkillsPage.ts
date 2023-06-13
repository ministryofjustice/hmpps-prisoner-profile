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
  WAA_card = (): PageElement => cy.get('.govuk-grid-column-three-quarters > :nth-child(2) > .govuk-grid-column-full')

  WAA_header = (): PageElement => cy.get('#work-and-activities > [data-qa="summary-header"] > h2')

  WAA_info = (): PageElement => cy.get('#work-and-activities > .hmpps-summary-card__body > :nth-child(1)')

  WAA_heading = (): PageElement => cy.get('#work-and-activities > .hmpps-summary-card__body > :nth-child(1)')

  WAA_keyChild1 = (): PageElement =>
    cy.get(
      '#work-and-activities > .hmpps-summary-card__body > .govuk-summary-list > :nth-child(1) > .govuk-summary-list__key',
    )

  WAA_valueChild1 = (): PageElement =>
    cy.get(
      '#work-and-activities > .hmpps-summary-card__body > .govuk-summary-list > :nth-child(1) > .govuk-summary-list__value',
    )

  WAA_viewWorkAndActivity = (): PageElement =>
    cy.get('#work-and-activities > .hmpps-summary-card__body > :nth-child(5) > .govuk-link--no-visited-state')

  WAA_viewSevenDay = (): PageElement => cy.get('#work-and-activities > .hmpps-summary-card__body > :nth-child(6)')

  WAA_absences = (): PageElement => cy.get('#work-and-activities > .hmpps-summary-card__body > :nth-child(7)')

  WAA_last30Days = (): PageElement => cy.get('.govuk-grid-column-one-third > .govuk-heading-s')

  WAA_numberOfDays = (): PageElement =>
    cy.get('#work-and-activities > .hmpps-summary-card__body > .govuk-grid-row > .govuk-grid-column-two-thirds')

  WAA_label = (): PageElement => cy.get('.hmpps-summary-card__body > :nth-child(11)')

  WAA_emptyStateMessage = (): PageElement =>
    cy.get('#work-and-activities > .hmpps-summary-card__body > p:nth-of-type(2)')

  // ES = Employability skills card
  ES_card = (): PageElement => cy.get('#employability-skills')

  ES_header = (): PageElement => cy.get('#employability-skills > [data-qa="summary-header"] > h2')

  ES_heading = (): PageElement => cy.get('#employability-skills > .hmpps-summary-card__body > .govuk-heading-s')

  ES_skillOne = (): PageElement => cy.get('.govuk-grid-column-one-third > .govuk-body')

  ES_skillLevelOne = (): PageElement => cy.get('.govuk-grid-column-two-thirds > p')

  // Goals card
  GoalsCard = (): PageElement => cy.get('#goals')

  GoalsHeader = (): PageElement => cy.get('#goals > [data-qa="summary-header"] > h2')

  GoalsInfo = (): PageElement => cy.get('#goals > .hmpps-summary-card__body > p')

  GoalsEmploymentLabel = (): PageElement => cy.get('#goals > .hmpps-summary-card__body > :nth-child(2)')

  GoalsEmploymentText = (): PageElement => cy.get('#goals > .hmpps-summary-card__body > :nth-child(3)')

  GoalsPersonalLabel = (): PageElement => cy.get('#goals > .hmpps-summary-card__body > :nth-child(4)')

  GoalsPersonalText = (): PageElement => cy.get('#goals > .hmpps-summary-card__body > :nth-child(5)')

  GoalsShortTermLabel = (): PageElement => cy.get('#goals > .hmpps-summary-card__body > :nth-child(6)')

  GoalsShortTermText = (): PageElement => cy.get('#goals > .hmpps-summary-card__body > :nth-child(7)')

  GoalsLongTermLabel = (): PageElement => cy.get('#goals > .hmpps-summary-card__body > :nth-child(8)')

  GoalsLongTermText = (): PageElement => cy.get('#goals > .hmpps-summary-card__body > :nth-child(9)')

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
