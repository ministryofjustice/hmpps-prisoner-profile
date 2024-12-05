import Page from '../pages/page'
import CaseNotesPage from '../pages/caseNotesPage'
import NotFoundPage from '../pages/notFoundPage'
import { Role } from '../../server/data/enums/role'
import UpdateCaseNotePage from '../pages/updateCaseNotePage'

const visitCaseNotesPage = (): CaseNotesPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/case-notes' })
  return Page.verifyOnPageWithTitle(CaseNotesPage, 'Case notes')
}

context('Update Case Note Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupComponentsData()
    cy.task('stubGetCaseNotes', { prisonerNumber: 'G6123VU' })
    cy.task('stubGetCaseNotesUsage', 'G6123VU')
    cy.task('stubGetCaseNoteTypes')
    cy.task('stubUpdateCaseNote')
  })

  context('As a user with prisoner in their caseload', () => {
    let caseNotesPage: CaseNotesPage
    let updateCaseNotePage: UpdateCaseNotePage

    beforeEach(() => {
      cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
      cy.task('stubInmateDetail', { bookingId: 1102484 })
      cy.task('stubPrisonerDetail', 'G6123VU')
    })

    context('Update a case note', () => {
      beforeEach(() => {
        caseNotesPage = visitCaseNotesPage()

        cy.task('stubGetCaseNote', { prisonerNumber: 'G6123VU', caseNoteId: '123456', isOmic: false })
        caseNotesPage.addMoreDetailsButton().first().click()
        cy.location('pathname').should('eq', '/prisoner/G6123VU/update-case-note/123456')
        updateCaseNotePage = new UpdateCaseNotePage('Add more details to John Saunders’ case note')
      })

      it('should show correct prisoner number and current case note values', () => {
        updateCaseNotePage.prisonerNumber().contains('G6123VU')
        updateCaseNotePage.moreDetailsText().contains('Additional case note text, part one.')
        updateCaseNotePage.textField().should('have.value', '')
      })

      it('should save successfully when valid data is entered', () => {
        updateCaseNotePage.textField().type('This is a test')
        updateCaseNotePage.saveButton().click()
        cy.location('pathname').should('eq', '/prisoner/G6123VU/case-notes')
        caseNotesPage.successMessage().should('contain.text', 'Case note updated')
      })
    })

    context('Updating an OMiC Open Case Note', () => {
      beforeEach(() => {
        cy.setupUserAuth({ roles: [Role.GlobalSearch, Role.PomUser] })
        cy.setupComponentsData()
        cy.task('stubGetSensitiveCaseNotesPage', 'G6123VU')
        cy.task('stubGetCaseNotes', { prisonerNumber: 'G6123VU', includeSensitive: true })
        cy.task('stubGetCaseNote', { prisonerNumber: 'G6123VU', caseNoteId: '123456', isOmic: true })

        caseNotesPage = visitCaseNotesPage()

        caseNotesPage.addMoreDetailsButton().first().click()

        cy.location('pathname').should('eq', '/prisoner/G6123VU/update-case-note/123456')
        updateCaseNotePage = new UpdateCaseNotePage('Add more details to John Saunders’ case note')
      })

      it('should show OMiC Open Case Note warning and hint', () => {
        updateCaseNotePage.omicWarning().should('be.visible')
        updateCaseNotePage.omicHint().should('be.visible')
      })
    })

    context('Attempting to update with validation errors', () => {
      beforeEach(() => {
        caseNotesPage = visitCaseNotesPage()
        cy.task('stubGetCaseNote', { prisonerNumber: 'G6123VU', caseNoteId: '123456', isOmic: false, longText: true })
        caseNotesPage.addMoreDetailsButton().first().click()
        cy.location('pathname').should('eq', '/prisoner/G6123VU/update-case-note/123456')
        updateCaseNotePage = new UpdateCaseNotePage('Add more details to John Saunders’ case note')
      })

      it('should show validation messages when no data is entered', () => {
        updateCaseNotePage.saveButton().click()
        cy.location('pathname').should('eq', '/prisoner/G6123VU/update-case-note/123456')
        updateCaseNotePage.errorBlock().should('exist')
        updateCaseNotePage.errorBlock().should('contain.text', 'Enter additional details')
      })

      it('should show validation messages when additional text is too long', () => {
        updateCaseNotePage.textField().type('Long text here to show validation error on page.')
        updateCaseNotePage.saveButton().click()
        cy.location('pathname').should('eq', '/prisoner/G6123VU/update-case-note/123456')
        updateCaseNotePage.errorBlock().should('exist')
        updateCaseNotePage.errorBlock().should('contain.text', 'Enter additional details using 11 characters or less')
      })
    })
  })

  context('As a user without prisoner in their caseload', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.GlobalSearch] })
      cy.setupComponentsData({
        caseLoads: [
          {
            caseloadFunction: '',
            caseLoadId: 'ZZZ',
            currentlyActive: true,
            description: '',
            type: '',
          },
        ],
      })
      cy.task('stubGetCaseNoteTypes')
    })

    context('Page Not Found', () => {
      beforeEach(() => {
        cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
        cy.task('stubInmateDetail', { bookingId: 1102484 })
        cy.task('stubPrisonerDetail', 'G6123VU')
        cy.task('stubGetCaseNotesUsage', 'G6123VU')
        cy.task('stubGetCaseNotes', 'G6123VU')
        cy.task('stubGetCaseNotes', { prisonerNumber: 'G6123VU' })
      })

      it('Displays Page Not Found', () => {
        cy.signIn({ failOnStatusCode: false, redirectPath: '/prisoner/G6123VU/update-case-note/123456' })
        Page.verifyOnPage(NotFoundPage)
      })
    })
  })
})
