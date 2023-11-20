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
  })

  context('Professional contacts list page', () => {
    let professionalContactsPage: ProfessionalContactsPage

    beforeEach(() => {
      professionalContactsPage = visitProfessionalContactsPage()
    })

    it('should contain a list of contacts', () => {
      professionalContactsPage.h1().contains('John Saunders’ professional contacts')
      professionalContactsPage.contacts().should('have.length', 8)

      const firstContact = professionalContactsPage.firstContact()
      firstContact.get('div [data-qa="summary-header"]').contains('Responsible Officer')
      firstContact
        .get('.hmpps-summary-card__body > .govuk-summary-list > div[data-qa="contact-name"]')
        .contains('John Smith')

      firstContact
        .get('.hmpps-summary-card__body > .govuk-summary-list > div[data-qa="contact-details"]')
        .contains('email1@email.com')
        .contains('email2@email.com')
        .contains('07700000000')
        .contains('4444555566')

      firstContact
        .get('.hmpps-summary-card__body > .govuk-summary-list > div[data-qa="contact-address"]')
        .contains('Flat 7, premises address, street field')
    })
  })
})
