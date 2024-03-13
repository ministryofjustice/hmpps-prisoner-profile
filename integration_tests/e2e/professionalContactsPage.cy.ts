import Page from '../pages/page'
import ProfessionalContactsPage from '../pages/professionalContactsPage'
import { mockContactDetailWithNotEntered } from '../../server/data/localMockData/contactDetail'

const visitProfessionalContactsPage = (): ProfessionalContactsPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/professional-contacts' })
  return Page.verifyOnPageWithTitle(ProfessionalContactsPage, 'John Saunders’ professional contacts')
}

context('Professional contacts list page', () => {
  let professionalContactsPage: ProfessionalContactsPage

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()

    cy.task('stubPrisonerData', { prisonerNumber: 'G6123VU' })
    cy.task('stubGetOffenderContacts')
    cy.task('stubGetCommunityManager')
    cy.task('stubKeyWorkerData', 'G6123VU')
    cy.task('stubPomData', 'G6123VU')
    cy.task('stubPersonAddresses')
    cy.task('stubPersonEmails')
    cy.task('stubPersonPhones')
    professionalContactsPage = visitProfessionalContactsPage()
  })

  it('should contain a list of contacts', () => {
    professionalContactsPage.h1().contains('John Saunders’ professional contacts')
    professionalContactsPage.contacts().should('have.length', 12)

    const pomContact = professionalContactsPage.pomContact()
    pomContact.header().contains('Prison Offender Manager')
    pomContact.name().contains('Andy Marke')

    const coPomContact = professionalContactsPage.coPomContact()
    coPomContact.header().contains('Co-working Prison Offender Manager')
    coPomContact.name().contains('Andy Hudson')

    const comContact = professionalContactsPage.comContact()
    comContact.header().contains('Community Offender Manager')
    comContact.name().contains('Terry Scott')
    comContact
      .contactDetails()
      .contains('terry@email.com')
      .contains('team@email.com')
      .contains('07700000000')
      .contains('07711111111')
    comContact.address().contains('Not entered')

    const keyWorkerContact = professionalContactsPage.keyWorkerContact()
    keyWorkerContact.header().contains('Key Worker')
    keyWorkerContact.name().contains('Dave Stevens')
    keyWorkerContact.contactDetails().contains('1@1.com')
    keyWorkerContact.address().contains('Not entered')

    const firstPrisonContact = professionalContactsPage.firstPrisonContact()
    firstPrisonContact.header().contains('Responsible Officer')
    firstPrisonContact.name().contains('John Smith')
    firstPrisonContact
      .contactDetails()
      .contains('email1@email.com')
      .contains('email2@email.com')
      .contains('07700000000')
      .contains('4444555566')
    firstPrisonContact.address().contains('Flat 7, premises address, street field')
  })
})

context('Professional contacts list page - with address not entered', () => {
  let professionalContactsPage: ProfessionalContactsPage

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()

    cy.task('stubPrisonerData', { prisonerNumber: 'G6123VU' })
    cy.task('stubGetOffenderContacts', mockContactDetailWithNotEntered)
    cy.task('stubGetCommunityManager')
    cy.task('stubKeyWorkerData', 'G6123VU')
    cy.task('stubPomData', 'G6123VU')
    cy.task('stubPersonAddresses', [])
    cy.task('stubPersonEmails', [])
    cy.task('stubPersonPhones', [])
    professionalContactsPage = visitProfessionalContactsPage()
  })

  it('should include contacts with no address entered', () => {
    professionalContactsPage.h1().contains('John Saunders’ professional contacts')
    professionalContactsPage.contacts().should('have.length', 5)

    const resettlementWorkerContact = professionalContactsPage.resettlementWorkerContact()
    resettlementWorkerContact.header().contains('Resettlement Worker')
    resettlementWorkerContact.name().contains('Barry Jones')
    resettlementWorkerContact.contactDetails().contains('Not entered')
    resettlementWorkerContact.address().contains('Not entered')
  })
})
