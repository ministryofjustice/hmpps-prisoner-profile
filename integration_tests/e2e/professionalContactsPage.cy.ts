import Page from '../pages/page'
import ProfessionalContactsPage from '../pages/professionalContactsPage'
import {
  mockContactDetailWithNotEntered,
  mockContactDetailYouthEstate,
} from '../../server/data/localMockData/contactDetail'

const visitProfessionalContactsPage = (): ProfessionalContactsPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/professional-contacts' })
  return Page.verifyOnPageWithTitle(ProfessionalContactsPage, 'John Saunders’ professional contacts')
}

context('Professional contacts list page', () => {
  let professionalContactsPage: ProfessionalContactsPage

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupComponentsData()
    cy.task('stubPrisonerData', { prisonerNumber: 'G6123VU' })
    cy.task('stubGetOffenderContacts')
    cy.task('stubGetCommunityManager')
    cy.task('stubKeyWorkerData', { prisonerNumber: 'G6123VU' })
    cy.task('stubPomData')
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
    firstPrisonContact.address().contains('7, premises address, street field')

    professionalContactsPage.backLink().should('exist')
  })
})

context('Professional contacts list page - with address not entered', () => {
  let professionalContactsPage: ProfessionalContactsPage

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupComponentsData()
    cy.task('stubPrisonerData', { prisonerNumber: 'G6123VU' })
    cy.task('stubGetOffenderContacts', mockContactDetailWithNotEntered)
    cy.task('stubGetCommunityManager')
    cy.task('stubKeyWorkerData', { prisonerNumber: 'G6123VU' })
    cy.task('stubPomData')
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

context('Professional contacts list page - youth estate', () => {
  let professionalContactsPage: ProfessionalContactsPage

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupComponentsData({
      caseLoads: [
        {
          caseloadFunction: '',
          caseLoadId: 'WYI',
          currentlyActive: true,
          description: '',
          type: '',
        },
      ],
    })
    cy.task('stubPrisonerData', { prisonerNumber: 'G6123VU', overrides: { prisonId: 'WYI' } })
    cy.task('stubGetOffenderContacts', mockContactDetailYouthEstate)
    cy.task('stubPersonAddresses', [])
    cy.task('stubPersonEmails', [])
    cy.task('stubPersonPhones', [])
    professionalContactsPage = visitProfessionalContactsPage()
  })

  it('should include YOI contacts', () => {
    professionalContactsPage.h1().contains('John Saunders’ professional contacts')
    professionalContactsPage.contacts().should('have.length', 7)

    const cuspOfficer = professionalContactsPage.cuspOfficer()
    cuspOfficer.header().contains('CuSP Officer')
    cuspOfficer.name().contains('Mike Tester')
    cuspOfficer.contactDetails().contains('Not entered')
    cuspOfficer.address().contains('Not entered')

    const cuspOfficerBackup = professionalContactsPage.cuspOfficerBackup()
    cuspOfficerBackup.header().contains('CuSP Officer (backup)')
    cuspOfficerBackup.name().contains('Katie Testing')
    cuspOfficerBackup.contactDetails().contains('Not entered')
    cuspOfficerBackup.address().contains('Not entered')

    const youthJusticeWorkerLatest = professionalContactsPage.youthJusticeWorkerLatest()
    youthJusticeWorkerLatest.header().contains('Youth Justice Worker')
    youthJusticeWorkerLatest.name().contains('Emma Justice')
    youthJusticeWorkerLatest.contactDetails().contains('Not entered')
    youthJusticeWorkerLatest.address().contains('Not entered')

    const youthJusticeWorkerOther = professionalContactsPage.youthJusticeWorkerOther()
    youthJusticeWorkerOther.header().contains('Youth Justice Worker')
    youthJusticeWorkerOther.name().contains('Emma Checked')
    youthJusticeWorkerOther.contactDetails().contains('Not entered')
    youthJusticeWorkerOther.address().contains('Not entered')

    const resettlementPractitioner = professionalContactsPage.resettlementPractitioner()
    resettlementPractitioner.header().contains('Resettlement Practitioner')
    resettlementPractitioner.name().contains('Shauna Michaels')
    resettlementPractitioner.contactDetails().contains('Not entered')
    resettlementPractitioner.address().contains('Not entered')

    const youthJusticeService = professionalContactsPage.youthJusticeService()
    youthJusticeService.header().contains('Youth Justice Service')
    youthJusticeService.name().contains('Outer York')
    youthJusticeService.contactDetails().contains('Not entered')
    youthJusticeService.address().contains('Not entered')

    const youthJusticeServiceCaseManager = professionalContactsPage.youthJusticeServiceCaseManager()
    youthJusticeServiceCaseManager.header().contains('Youth Justice Service Case Manager')
    youthJusticeServiceCaseManager.name().contains('Barney Rubble')
    youthJusticeServiceCaseManager.contactDetails().contains('Not entered')
    youthJusticeServiceCaseManager.address().contains('Not entered')
  })
})

context('Professional contacts list page - given API to get key worker name fails', () => {
  let professionalContactsPage: ProfessionalContactsPage

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupComponentsData()
    cy.task('stubPrisonerData', { prisonerNumber: 'G6123VU' })
    cy.task('stubGetOffenderContacts', mockContactDetailWithNotEntered)
    cy.task('stubGetCommunityManager')
    cy.task('stubKeyWorkerData', { prisonerNumber: 'G6123VU', error: true })
    cy.task('stubPomData')
    cy.task('stubPersonAddresses', [])
    cy.task('stubPersonEmails', [])
    cy.task('stubPersonPhones', [])
    professionalContactsPage = visitProfessionalContactsPage()
  })

  it('Displays a page error banner and an error message replacing the key worker details', () => {
    professionalContactsPage.apiErrorBanner().should('exist')
    professionalContactsPage.apiErrorBanner().contains('p', 'Sorry, there is a problem with the service')

    const keyWorkerContact = professionalContactsPage.keyWorkerContact()
    keyWorkerContact.header().contains('Key Worker')
    keyWorkerContact.errorMessage().contains('We cannot show these details right now. Try again later.')
  })
})

context('Professional contacts list page - no contacts', () => {
  let professionalContactsPage: ProfessionalContactsPage

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupComponentsData()
    cy.task('stubPrisonerData', { prisonerNumber: 'G6123VU' })
    cy.task('stubGetOffenderContacts', [])
    cy.task('stubGetCommunityManagerNotFound')
    cy.task('stubKeyWorkerData', { prisonerNumber: 'G6123VU', notFound: true })
    cy.task('stubPomDataNotFound')
    cy.task('stubPersonAddresses', [])
    cy.task('stubPersonEmails', [])
    cy.task('stubPersonPhones', [])
    professionalContactsPage = visitProfessionalContactsPage()
  })

  it('should show no contacts message', () => {
    professionalContactsPage.h1().contains('John Saunders’ professional contacts')
    professionalContactsPage.contacts().should('have.length', 0)

    professionalContactsPage.noContactsMessage().should('be.visible')
  })
})
