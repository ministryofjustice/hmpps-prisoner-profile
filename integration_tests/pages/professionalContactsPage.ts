import Page, { PageElement } from './page'

export default class ProfessionalContactsPage extends Page {
  h1 = (): PageElement => cy.get('h1')

  contacts = (): PageElement => cy.get('.hmpps-summary-card')

  comContact = (): PageElement => cy.get('.hmpps-summary-card').first()

  firstPrisonContact = (): PageElement => cy.get('.hmpps-summary-card').eq(1)
}
