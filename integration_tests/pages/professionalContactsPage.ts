import Page, { PageElement } from './page'

export default class ProfessionalContactsPage extends Page {
  h1 = (): PageElement => cy.get('h1')

  contacts = (): PageElement => cy.get('.hmpps-summary-card')

  keyWorkerContact = () => ({
    panel: (): PageElement => cy.get('.hmpps-summary-card').first(),
    header: (): PageElement => this.keyWorkerContact().panel().get('[data-qa="summary-header"]'),
    name: (): PageElement => this.keyWorkerContact().panel().find('[data-qa="contact-name"]'),
    contactDetails: (): PageElement => this.keyWorkerContact().panel().find('[data-qa="contact-details"]'),
    address: (): PageElement => this.keyWorkerContact().panel().find('[data-qa="contact-address"]'),
    errorMessage: (): PageElement => this.keyWorkerContact().panel().find('[data-qa="contact-api-error"]'),
  })

  pomContact = () => ({
    panel: (): PageElement => cy.get('.hmpps-summary-card').eq(1),
    header: (): PageElement => this.pomContact().panel().get('[data-qa="summary-header"]'),
    name: (): PageElement => this.pomContact().panel().find('[data-qa="contact-name"]'),
  })

  coPomContact = () => ({
    panel: (): PageElement => cy.get('.hmpps-summary-card').eq(2),
    header: (): PageElement => this.coPomContact().panel().get('div [data-qa="summary-header"]'),
    name: (): PageElement => this.coPomContact().panel().find('[data-qa="contact-name"]'),
  })

  comContact = () => ({
    panel: (): PageElement => cy.get('.hmpps-summary-card').eq(3),
    header: (): PageElement => this.comContact().panel().get('[data-qa="summary-header"]'),
    name: (): PageElement => this.comContact().panel().find('[data-qa="contact-name"]'),
    contactDetails: (): PageElement => this.comContact().panel().find('[data-qa="contact-details"]'),
    address: (): PageElement => this.comContact().panel().find('[data-qa="contact-address"]'),
  })

  resettlementWorkerContact = () => ({
    panel: (): PageElement => cy.get('.hmpps-summary-card').eq(4),
    header: (): PageElement => this.resettlementWorkerContact().panel().get('[data-qa="summary-header"]'),
    name: (): PageElement => this.resettlementWorkerContact().panel().find('[data-qa="contact-name"]'),
    contactDetails: (): PageElement => this.resettlementWorkerContact().panel().find('[data-qa="contact-details"]'),
    address: (): PageElement => this.resettlementWorkerContact().panel().find('[data-qa="contact-address"]'),
  })

  firstPrisonContact = () => ({
    panel: (): PageElement => cy.get('.hmpps-summary-card').eq(4),
    header: (): PageElement => this.firstPrisonContact().panel().get('[data-qa="summary-header"]'),
    name: (): PageElement => this.firstPrisonContact().panel().find('[data-qa="contact-name"]'),
    contactDetails: (): PageElement => this.firstPrisonContact().panel().find('[data-qa="contact-details"]'),
    address: (): PageElement => this.firstPrisonContact().panel().find('[data-qa="contact-address"]'),
  })

  cuspOfficer = () => ({
    panel: (): PageElement => cy.get('.hmpps-summary-card').eq(0),
    header: (): PageElement => this.cuspOfficer().panel().get('[data-qa="summary-header"]'),
    name: (): PageElement => this.cuspOfficer().panel().find('[data-qa="contact-name"]'),
    contactDetails: (): PageElement => this.cuspOfficer().panel().find('[data-qa="contact-details"]'),
    address: (): PageElement => this.cuspOfficer().panel().find('[data-qa="contact-address"]'),
  })

  cuspOfficerBackup = () => ({
    panel: (): PageElement => cy.get('.hmpps-summary-card').eq(1),
    header: (): PageElement => this.cuspOfficerBackup().panel().get('[data-qa="summary-header"]'),
    name: (): PageElement => this.cuspOfficerBackup().panel().find('[data-qa="contact-name"]'),
    contactDetails: (): PageElement => this.cuspOfficerBackup().panel().find('[data-qa="contact-details"]'),
    address: (): PageElement => this.cuspOfficerBackup().panel().find('[data-qa="contact-address"]'),
  })

  youthJusticeWorkerLatest = () => ({
    panel: (): PageElement => cy.get('.hmpps-summary-card').eq(2),
    header: (): PageElement => this.youthJusticeWorkerLatest().panel().get('[data-qa="summary-header"]'),
    name: (): PageElement => this.youthJusticeWorkerLatest().panel().find('[data-qa="contact-name"]'),
    contactDetails: (): PageElement => this.youthJusticeWorkerLatest().panel().find('[data-qa="contact-details"]'),
    address: (): PageElement => this.youthJusticeWorkerLatest().panel().find('[data-qa="contact-address"]'),
  })

  youthJusticeWorkerOther = () => ({
    panel: (): PageElement => cy.get('.hmpps-summary-card').eq(3),
    header: (): PageElement => this.youthJusticeWorkerOther().panel().get('[data-qa="summary-header"]'),
    name: (): PageElement => this.youthJusticeWorkerOther().panel().find('[data-qa="contact-name"]'),
    contactDetails: (): PageElement => this.youthJusticeWorkerOther().panel().find('[data-qa="contact-details"]'),
    address: (): PageElement => this.youthJusticeWorkerOther().panel().find('[data-qa="contact-address"]'),
  })

  resettlementPractitioner = () => ({
    panel: (): PageElement => cy.get('.hmpps-summary-card').eq(4),
    header: (): PageElement => this.resettlementPractitioner().panel().get('[data-qa="summary-header"]'),
    name: (): PageElement => this.resettlementPractitioner().panel().find('[data-qa="contact-name"]'),
    contactDetails: (): PageElement => this.resettlementPractitioner().panel().find('[data-qa="contact-details"]'),
    address: (): PageElement => this.resettlementPractitioner().panel().find('[data-qa="contact-address"]'),
  })

  youthJusticeServices = () => ({
    panel: (): PageElement => cy.get('.hmpps-summary-card').eq(5),
    header: (): PageElement => this.youthJusticeServices().panel().get('[data-qa="summary-header"]'),
    name: (): PageElement => this.youthJusticeServices().panel().find('[data-qa="contact-name"]'),
    contactDetails: (): PageElement => this.youthJusticeServices().panel().find('[data-qa="contact-details"]'),
    address: (): PageElement => this.youthJusticeServices().panel().find('[data-qa="contact-address"]'),
  })

  youthJusticeServiceCaseManager = () => ({
    panel: (): PageElement => cy.get('.hmpps-summary-card').eq(6),
    header: (): PageElement => this.youthJusticeServiceCaseManager().panel().get('[data-qa="summary-header"]'),
    name: (): PageElement => this.youthJusticeServiceCaseManager().panel().find('[data-qa="contact-name"]'),
    contactDetails: (): PageElement =>
      this.youthJusticeServiceCaseManager().panel().find('[data-qa="contact-details"]'),
    address: (): PageElement => this.youthJusticeServiceCaseManager().panel().find('[data-qa="contact-address"]'),
  })
}
