import Page from '../pages/page'
import CaseNotesPage from '../pages/caseNotesPage'
import NotFoundPage from '../pages/notFoundPage'
import { Role } from '../../server/data/enums/role'
import AddCaseNotePage from '../pages/addCaseNotePage'
import { formatDate } from '../../server/utils/dateHelpers'

const visitCaseNotesPage = (): CaseNotesPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/case-notes' })
  return Page.verifyOnPageWithTitle(CaseNotesPage, 'Case notes')
}

context('Add Case Note Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupComponentsData()
    cy.task('stubGetCaseNotes', { prisonerNumber: 'G6123VU' })
    cy.task('stubGetCaseNoteTypes')
    cy.task('stubAddCaseNote')
  })

  context('As a user with prisoner in their caseload', () => {
    let caseNotesPage: CaseNotesPage
    let addCaseNotePage: AddCaseNotePage

    beforeEach(() => {
      cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
      cy.task('stubInmateDetail', { bookingId: 1102484 })
      cy.task('stubPrisonerDetail', 'G6123VU')
      caseNotesPage = visitCaseNotesPage()
      caseNotesPage.addCaseNoteButton().click()
      cy.location('pathname').should('eq', '/prisoner/G6123VU/add-case-note')
      addCaseNotePage = new AddCaseNotePage('Add a case note')
    })

    context('Adding a valid case note', () => {
      it('should show correct prisoner number and default field values', () => {
        addCaseNotePage.typeField().contains('Choose type')
        addCaseNotePage.subTypeField().contains('Choose sub-type')
        addCaseNotePage.textField().should('have.value', '')
        addCaseNotePage.dateField().should('have.value', formatDate(new Date().toISOString(), 'short'))
        addCaseNotePage.hoursField().should('have.value', new Date().getHours().toString().padStart(2, '0'))
        addCaseNotePage.minutesField().should('have.value', new Date().getMinutes().toString().padStart(2, '0'))
      })

      it('should use the right url for back and cancel', () => {
        addCaseNotePage.backLink().should('have.attr', 'href').and('contain', '/prisoner/G6123VU/case-notes')
        addCaseNotePage.cancelButton().should('have.attr', 'href').and('contain', '/prisoner/G6123VU/case-notes')
      })

      it('should save successfully when valid data is entered', () => {
        addCaseNotePage.typeField().select('Accredited Programme')
        addCaseNotePage.typeField().invoke('val').should('eq', 'ACP')
        addCaseNotePage.subTypeField().children().should('have.length', '2')
        addCaseNotePage.subTypeField().select('Assessment')
        addCaseNotePage.subTypeField().invoke('val').should('eq', 'ASSESSMENT')
        addCaseNotePage.textField().type('This is a test')
        addCaseNotePage.saveButton().click()
        cy.location('pathname').should('eq', '/prisoner/G6123VU/case-notes')
        caseNotesPage.successMessage().should('contain.text', 'Case note added')
      })
    })

    context('Choosing OMiC Open Case Note', () => {
      it('should show OMiC Open Case Note warning and hint', () => {
        addCaseNotePage.typeField().select('OMiC')
        addCaseNotePage.subTypeField().select('Open Case Note')
        addCaseNotePage
          .typeWarning()
          .should(
            'contain.text',
            'This case note could be read by anyone with access to Digital Prison Services.  Check all information recorded here is appropriate and necessary to share across the prison.',
          )
        addCaseNotePage.typeWarning().should('be.visible')
        addCaseNotePage.omicHint().should('be.visible')
      })
    })

    context('Choosing Key Worker Activity type', () => {
      it('should show Key Worker Entry warning and hint', () => {
        addCaseNotePage.typeField().select('Key Worker Activity')
        addCaseNotePage.subTypeField().select('Key Worker Entry')
        addCaseNotePage.typeWarning().should('be.visible')
        addCaseNotePage
          .typeWarning()
          .should(
            'contain.text',
            'Use this option to record an activity related to key work that was not a full session. This could include recording when a session did not take place or any other interaction with an allocated prisoner.',
          )
        addCaseNotePage.omicHint().should('not.be.visible')
      })

      it('should show Key Worker Session warning and hint', () => {
        addCaseNotePage.typeField().select('Key Worker Activity')
        addCaseNotePage.subTypeField().select('Key Worker Session')
        addCaseNotePage.typeWarning().should('be.visible')
        addCaseNotePage
          .typeWarning()
          .should(
            'contain.text',
            'You should only use this option when you’ve completed a full key worker session with a prisoner. Any other interaction should be recorded as an entry.',
          )
        addCaseNotePage.omicHint().should('not.be.visible')
      })
    })

    context('Attempting to add an invalid case note', () => {
      it('should show validation messages when no data is entered', () => {
        addCaseNotePage.dateField().clear()
        addCaseNotePage.hoursField().clear()
        addCaseNotePage.minutesField().clear()
        addCaseNotePage.saveButton().click()
        cy.location('pathname').should('eq', '/prisoner/G6123VU/add-case-note')
        addCaseNotePage.errorBlock().should('exist')
        addCaseNotePage.errorBlock().should('contain.text', 'Select the case note type')
        addCaseNotePage.errorBlock().should('contain.text', 'Select the case note sub-type')
        addCaseNotePage.errorBlock().should('contain.text', 'Enter what happened')
        addCaseNotePage.errorBlock().should('contain.text', 'Select the date when this happened')
        addCaseNotePage.errorBlock().should('contain.text', 'Enter an hour which is 23 or less')
        addCaseNotePage.errorBlock().should('contain.text', 'Enter the minutes using 59 or less')
        addCaseNotePage.errorBlock().should('contain.text', 'Select the time when this happened')
        addCaseNotePage.typeField().should('have.class', 'govuk-select--error')
        addCaseNotePage.subTypeField().should('have.class', 'govuk-select--error')
        addCaseNotePage.hoursField().should('have.class', 'govuk-input--error')
        addCaseNotePage.minutesField().should('have.class', 'govuk-input--error')
      })

      it('should show validation messages when invalid data is entered', () => {
        addCaseNotePage.dateField().clear().type('abc')
        addCaseNotePage.hoursField().clear().type('hh')
        addCaseNotePage.minutesField().clear().type('mm')
        addCaseNotePage.saveButton().click()
        cy.location('pathname').should('eq', '/prisoner/G6123VU/add-case-note')
        addCaseNotePage.errorBlock().should('exist')
        addCaseNotePage.errorBlock().should('contain.text', 'Select the case note type')
        addCaseNotePage.errorBlock().should('contain.text', 'Select the case note sub-type')
        addCaseNotePage.errorBlock().should('contain.text', 'Enter what happened')
        addCaseNotePage
          .errorBlock()
          .should('contain.text', 'Enter a real date in the format DD/MM/YYYY - for example, 27/03/2023')
        addCaseNotePage.errorBlock().should('contain.text', 'Enter an hour using numbers only')
        addCaseNotePage.errorBlock().should('contain.text', 'Enter the minutes using numbers only')
        addCaseNotePage.hoursField().should('have.class', 'govuk-input--error')
        addCaseNotePage.minutesField().should('have.class', 'govuk-input--error')
      })
    })
  })

  context('As a user without prisoner in their caseload', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.GlobalSearch] })
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
        cy.task('stubGetCaseNotes', { prisonerNumber: 'G6123VU' })
      })

      it('Displays Page Not Found', () => {
        cy.signIn({ failOnStatusCode: false, redirectPath: '/prisoner/G6123VU/add-case-note' })
        Page.verifyOnPage(NotFoundPage)
      })
    })
  })
})
