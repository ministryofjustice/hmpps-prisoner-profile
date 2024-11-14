import ProbationDocumentsPage from '../pages/probationDocuments'
import { permissionsTests } from './permissionsTests'
import Page from '../pages/page'
import { Role } from '../../server/data/enums/role'

context('Probation documents page', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484

  context('Permissions', () => {
    const visitPage = prisonerDataOverrides => {
      cy.task('stubGetProbationDocuments')
      cy.setupBannerStubs({ prisonerNumber, bookingId, prisonerDataOverrides })
      cy.signIn({ failOnStatusCode: false, redirectPath: 'prisoner/G6123VU/probation-documents' })
    }
    permissionsTests({
      prisonerNumber,
      visitPage,
      pageToDisplay: ProbationDocumentsPage,
      options: { additionalRoles: [Role.ViewProbationDocuments], preventGlobalAccess: true },
    })
  })

  context('Probation documents are found', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.ViewProbationDocuments] })
      cy.setupBannerStubs({ prisonerNumber, bookingId })
      cy.setupOverviewPageStubs({ prisonerNumber, bookingId })
      cy.task('stubGetProbationDocuments')
    })

    it('Display the probation documents page', () => {
      cy.signIn({ redirectPath: 'prisoner/G6123VU/probation-documents' })
      Page.verifyOnPage(ProbationDocumentsPage)
    })

    it('Displays the general documents information', () => {
      cy.signIn({ redirectPath: 'prisoner/G6123VU/probation-documents' })
      const page = Page.verifyOnPage(ProbationDocumentsPage)
      page.generalDocuments(0).details().documentLink().should('include.text', 'PRE-CONS.pdf')
      page.generalDocuments(0).details().documentTypeAndAuthor().should('include.text', 'PNC previous convictions')
      page.generalDocuments(0).details().documentTypeAndAuthor().should('include.text', 'Andy Marke')
      page
        .generalDocuments(0)
        .details()
        .documentDescription()
        .should('include.text', 'Previous convictions as of 01/09/2019')
      page.generalDocuments(0).date().should('include.text', '4 September 2018')
    })

    it('Displays the documents related to each sentence', () => {
      cy.signIn({ redirectPath: 'prisoner/G6123VU/probation-documents' })
      const page = Page.verifyOnPage(ProbationDocumentsPage)
      page.sentenceDocuments().expandAll()

      page.sentenceDocuments().sentence(0).title().should('include.text', 'CJA - Indeterminate Public Prot. (5 Years)')
      page.sentenceDocuments().sentence(0).title().should('include.text', 'Berwyn (HMP)')
      page.sentenceDocuments().sentence(0).description().should('include.text', 'Petting too many cats')
      page.sentenceDocuments().sentence(0).description().should('include.text', '4 September 2018')
      page.sentenceDocuments().sentence(0).description().should('include.text', 'Active')
      page.sentenceDocuments().sentence(0).documents(0).details().documentLink().should('include.text', 'Document One')
      page.sentenceDocuments().sentence(0).documents(0).details().documentTypeAndAuthor().should('include.text', 'type')
      page
        .sentenceDocuments()
        .sentence(0)
        .documents(0)
        .details()
        .documentTypeAndAuthor()
        .should('include.text', 'type created by Author')
      page
        .sentenceDocuments()
        .sentence(0)
        .documents(0)
        .details()
        .documentDescription()
        .should('include.text', 'Document description')
      page.sentenceDocuments().sentence(0).documents(0).date().should('include.text', '4 September 2018')
    })
  })

  context('Probation documents are not found', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.ViewProbationDocuments] })
      cy.setupBannerStubs({ prisonerNumber, bookingId })
      cy.setupOverviewPageStubs({ prisonerNumber, bookingId })
      cy.task('stubGetProbationDocuments', { notFound: true })
    })

    it('Display the probation documents page with an error', () => {
      cy.signIn({ redirectPath: 'prisoner/G6123VU/probation-documents' })
      const page = Page.verifyOnPage(ProbationDocumentsPage)
      page.errors().should('be.visible')
    })
  })
})
