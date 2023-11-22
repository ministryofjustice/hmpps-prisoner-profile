import Page, { PageElement } from './page'

export default class ProfessionalContactsPage extends Page {
  h1 = (): PageElement => cy.get('h1')

  contacts = (): PageElement => cy.get('.hmpps-summary-card')

  pomContact = () => ({
    panel: (): PageElement => cy.get('.hmpps-summary-card').first(),
    header: (): PageElement => this.pomContact().panel().get('[data-qa="summary-header"]'),
    name: (): PageElement => this.pomContact().panel().find('[data-qa="contact-name"]'),
  })

  coPomContact = () => ({
    panel: (): PageElement => cy.get('.hmpps-summary-card').eq(1),
    header: (): PageElement => this.coPomContact().panel().get('div [data-qa="summary-header"]'),
    name: (): PageElement => this.coPomContact().panel().find('[data-qa="contact-name"]'),
  })

  comContact = () => ({
    panel: (): PageElement => cy.get('.hmpps-summary-card').eq(2),
    header: (): PageElement => this.comContact().panel().get('[data-qa="summary-header"]'),
    name: (): PageElement => this.comContact().panel().find('[data-qa="contact-name"]'),
    contactDetails: (): PageElement => this.comContact().panel().find('[data-qa="contact-details"]'),
    address: (): PageElement => this.comContact().panel().find('[data-qa="contact-address"]'),
  })

  keyWorkerContact = () => ({
    panel: (): PageElement => cy.get('.hmpps-summary-card').eq(3),
    header: (): PageElement => this.keyWorkerContact().panel().get('[data-qa="summary-header"]'),
    name: (): PageElement => this.keyWorkerContact().panel().find('[data-qa="contact-name"]'),
    contactDetails: (): PageElement => this.keyWorkerContact().panel().find('[data-qa="contact-details"]'),
    address: (): PageElement => this.keyWorkerContact().panel().find('[data-qa="contact-address"]'),
  })

  firstPrisonContact = () => ({
    panel: (): PageElement => cy.get('.hmpps-summary-card').eq(4),
    header: (): PageElement => this.firstPrisonContact().panel().get('[data-qa="summary-header"]'),
    name: (): PageElement => this.firstPrisonContact().panel().find('[data-qa="contact-name"]'),
    contactDetails: (): PageElement => this.firstPrisonContact().panel().find('[data-qa="contact-details"]'),
    address: (): PageElement => this.firstPrisonContact().panel().find('[data-qa="contact-address"]'),
  })
}
