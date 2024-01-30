import Page, { PageElement } from './page'

export default class GoalsPage extends Page {
  h1 = (): PageElement => cy.get('h1')

  banner = (): PageElement => cy.get('.moj-banner')

  employmentGoalsList = (): PageElement => cy.get('[data-qa="employment-goals-list"]')

  personalGoalsList = (): PageElement => cy.get('[data-qa="personal-goals-list"]')

  shortTermGoalsList = (): PageElement => cy.get('[data-qa="short-term-goals-list"]')

  longTermGoalsList = (): PageElement => cy.get('[data-qa="long-term-goals-list"]')
}
