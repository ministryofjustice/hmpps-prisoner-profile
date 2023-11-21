import Page from '../pages/page'
import ProfessionalContactsPage from '../pages/professionalContactsPage'

const visitProfessionalContactsPage = (): ProfessionalContactsPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/professional-contacts' })
  return Page.verifyOnPageWithTitle(ProfessionalContactsPage, 'John Saunders’ professional contacts')
}

context('Professional contacts page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()

    cy.task('stubPrisonerData', { prisonerNumber: 'G6123VU' })

    cy.task('stubGetOffenderContacts', 1102484)
    cy.task('stubPersonAddresses', 5871791)
    cy.task('stubPersonEmails', 5871791)
    cy.task('stubPersonPhones', 5871791)
    cy.task('stubGetCommunityManager')
  })

  context('Professional contacts list page', () => {
    let professionalContactsPage: ProfessionalContactsPage

    beforeEach(() => {
      professionalContactsPage = visitProfessionalContactsPage()
    })

    it('should contain a list of contacts', () => {
      professionalContactsPage.h1().contains('John Saunders’ professional contacts')
      professionalContactsPage.contacts().should('have.length', 9)

      const comContact = professionalContactsPage.comContact()
      comContact.get('div [data-qa="summary-header"]').contains('Community Offender Manager')
      comContact
        .get('.hmpps-summary-card__body > .govuk-summary-list > div[data-qa="contact-name"]')
        .contains('Terry Scott')
      comContact
        .get('.hmpps-summary-card__body > .govuk-summary-list > div[data-qa="contact-details"]')
        .contains('terry@email.com')
        .contains('team@email.com')
      comContact
        .get('.hmpps-summary-card__body > .govuk-summary-list > div[data-qa="contact-address"]')
        .contains('Not entered')

      const firstPrisonContact = professionalContactsPage.firstPrisonContact()
      firstPrisonContact.get('div [data-qa="summary-header"]').contains('Responsible Officer')
      firstPrisonContact
        .get('.hmpps-summary-card__body > .govuk-summary-list > div[data-qa="contact-name"]')
        .contains('John Smith')

      firstPrisonContact
        .get('.hmpps-summary-card__body > .govuk-summary-list > div[data-qa="contact-details"]')
        .contains('email1@email.com')
        .contains('email2@email.com')
        .contains('07700000000')
        .contains('4444555566')

      firstPrisonContact
        .get('.hmpps-summary-card__body > .govuk-summary-list > div[data-qa="contact-address"]')
        .contains('Flat 7, premises address, street field')
    })
  })
})
