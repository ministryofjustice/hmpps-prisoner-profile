import Page from '../pages/page'
import CaseNotesPage from '../pages/caseNotesPage'
import NotFoundPage from '../pages/notFoundPage'
import { Role } from '../../server/data/enums/role'
import InmateDetail from '../../server/data/interfaces/prisonApi/InmateDetail'

const visitCaseNotesPage = (): CaseNotesPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/case-notes' })
  return Page.verifyOnPageWithTitle(CaseNotesPage, 'Case notes')
}

const visitEmptyCaseNotesPage = (): CaseNotesPage => {
  cy.signIn({ redirectPath: '/prisoner/A1234BC/case-notes' })
  return Page.verifyOnPageWithTitle(CaseNotesPage, 'Case notes')
}

context('Case Notes Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupComponentsData()
    cy.task('stubGetCaseNoteTypes')
  })

  context('Case Notes List', () => {
    let caseNotesPage: CaseNotesPage

    beforeEach(() => {
      cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
      cy.task('stubInmateDetail', { bookingId: 1102484 })
      cy.task('stubGetCaseNotes', { prisonerNumber: 'G6123VU' })
      caseNotesPage = visitCaseNotesPage()
    })

    it('should contain elements with CSS classes linked to Google Analytics', () => {
      cy.get('.info__links').should('exist')
      cy.get('.hmpps-profile-tab-links').should('exist')
    })

    it('Displays the add case note button', () => {
      caseNotesPage.addCaseNoteButton()
    })

    it('Displays the add more details link for the case note authored with staff id', () => {
      caseNotesPage
        .caseNotesList()
        .get('.hmpps-case-note-card-list-item:nth-of-type(2) [data-qa="case-notes-add-more-details-link"]')
    })

    it('Displays the add more details link for the case note authored with username', () => {
      caseNotesPage
        .caseNotesList()
        .get('.hmpps-case-note-card-list-item:nth-of-type(3) [data-qa="case-notes-add-more-details-link"]')
    })

    it('Does not display the add more details link for case notes authored by somebody else', () => {
      caseNotesPage
        .caseNotesList()
        .get('.hmpps-case-note-card-list-item:nth-of-type(4) [data-qa="case-notes-add-more-details-link"]')
        .should('not.exist')
    })

    it('Displays the list with 20 items', () => {
      caseNotesPage.caseNotesList().children().should('have.length', 20)
    })

    it('Displays the pagination correctly', () => {
      caseNotesPage.paginationPreviousLink().should('not.exist')
      caseNotesPage.paginationCurrentPage().contains('1')
      caseNotesPage.paginationNextLink().should('exist')
      caseNotesPage.paginationHeaderPageLink().should('have.length', 3)
      caseNotesPage.paginationFooterPageLink().should('have.length', 3)
    })

    it('Displays the pagination summary correctly', () => {
      caseNotesPage.paginationSummaryHeader().contains('Showing 1 to 20 of 80 case notes')
      caseNotesPage.paginationSummaryFooter().contains('Showing 1 to 20 of 80 case notes')
      caseNotesPage.viewAllLink().should('exist')
    })

    it('Display correct filter labels', () => {
      caseNotesPage.filterDateFromLabel().should('exist')
      caseNotesPage.filterDateFromLabel().should('contain', 'Date from (earliest)')
      caseNotesPage.filterDateToLabel().should('exist')
      caseNotesPage.filterDateToLabel().should('contain', 'Date to (latest)')
    })
  })

  context('No Case Notes', () => {
    let caseNotesPage

    beforeEach(() => {
      cy.setupBannerStubs({ prisonerNumber: 'A1234BC', bookingId: 1234567 })
      cy.task('stubInmateDetail', {
        bookingId: 1234567,
        inmateDetail: {
          prisonerNumber: 'A1234BC',
          bookingId: 1234567,
          activeAlertCount: 0,
          inactiveAlertCount: 0,
        } as Partial<InmateDetail>,
      })
      cy.task('stubGetCaseNotes', { prisonerNumber: 'A1234BC' })
      caseNotesPage = visitEmptyCaseNotesPage()
    })

    it('Displays the empty state message', () => {
      caseNotesPage.caseNotesList().should('not.exist')
      caseNotesPage.caseNotesEmptyState().should('contain', 'John Middle Names Saunders does not have any case notes')
    })

    it('Displays no pagination or pagination summary', () => {
      caseNotesPage.paginationHeader().should('not.exist')
      caseNotesPage.paginationFooter().should('not.exist')
      caseNotesPage.paginationSummaryHeader().should('not.exist')
      caseNotesPage.paginationSummaryFooter().should('not.exist')
      caseNotesPage.viewAllLink().should('not.exist')
    })
  })

  context('Paging', () => {
    let caseNotesPage

    beforeEach(() => {
      cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
      cy.task('stubInmateDetail', { bookingId: 1102484 })
      cy.task('stubGetCaseNotes', { prisonerNumber: 'G6123VU' })
      cy.task('stubGetCaseNotesPage2', 'G6123VU')
      caseNotesPage = visitCaseNotesPage()
    })

    it('Moves to page 2 when clicking Next and back to page 1 when clicking Previous', () => {
      caseNotesPage.paginationCurrentPage().contains('1')
      caseNotesPage.paginationNextLink().first().click()
      caseNotesPage.paginationCurrentPage().contains('2')
      caseNotesPage.paginationSummaryHeader().contains('Showing 21 to 40 of 80 case notes')

      caseNotesPage.paginationPreviousLink().first().click()
      caseNotesPage.paginationCurrentPage().contains('1')
      caseNotesPage.paginationSummaryHeader().contains('Showing 1 to 20 of 80 case notes')
    })
  })

  context('Sorting', () => {
    let caseNotesPage: CaseNotesPage

    beforeEach(() => {
      cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
      cy.task('stubInmateDetail', { bookingId: 1102484 })
      cy.task('stubGetCaseNotes', { prisonerNumber: 'G6123VU' })
      cy.task('stubGetCaseNotesSorted', 'G6123VU')
      caseNotesPage = visitCaseNotesPage()
    })

    it('Displays the case notes and sorts results by Created (oldest)', () => {
      caseNotesPage.sort().invoke('attr', 'value').should('eq', 'createdAt,DESC') // Default sort - Created (most recent)
      caseNotesPage.caseNotesListItem().first().contains('18 April 2023 at 17:15')
      caseNotesPage.caseNotesListItem().first().contains('Created by: John Smith')

      caseNotesPage.sort().select('Created (oldest)')

      caseNotesPage.sort().invoke('attr', 'value').should('eq', 'createdAt,ASC')
      caseNotesPage.caseNotesListItem().first().contains('9 January 2023 at 11:29')
      caseNotesPage.caseNotesListItem().first().contains('Created by: James T Kirk')
    })
  })

  context('Filtering', () => {
    let caseNotesPage

    beforeEach(() => {
      cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
      cy.task('stubInmateDetail', { bookingId: 1102484 })
      cy.task('stubGetCaseNotes', { prisonerNumber: 'G6123VU' })
      cy.task('stubGetCaseNotesFiltered', 'G6123VU')
      caseNotesPage = visitCaseNotesPage()
    })

    it('Displays the case notes and filters results', () => {
      caseNotesPage.caseNotesList().children().should('have.length', 20)

      caseNotesPage.filterType().select('Accredited Programme')
      caseNotesPage.filterApplyButton().click()

      caseNotesPage.caseNotesList().children().should('have.length', 1)
    })
  })
})

context('Sensitive Case Notes', () => {
  let caseNotesPage

  context('POM User - No role to delete sensitive case notes', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.PomUser] })
      cy.setupComponentsData()
      cy.task('stubGetCaseNoteTypes')
      cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
      cy.task('stubInmateDetail', { bookingId: 1102484 })
      cy.task('stubGetCaseNotes', { prisonerNumber: 'G6123VU' })
      cy.task('stubGetSensitiveCaseNotesPage', 'G6123VU')
      caseNotesPage = visitCaseNotesPage()
    })

    it('Does not display the delete link for the sensitive case note', () => {
      caseNotesPage.filterType().select('OMIC')
      caseNotesPage.filterApplyButton().click()

      caseNotesPage
        .caseNotesList()
        .get('.hmpps-case-note-card-list-item:nth-of-type(1) [data-qa="delete-case-note-link"]')
        .should('not.exist')
    })
  })

  context('POM User - Has role to delete sensitive case notes', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.PomUser, Role.DeleteSensitiveCaseNotes] })
      cy.setupComponentsData()
      cy.task('stubGetCaseNoteTypes')
      cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
      cy.task('stubInmateDetail', { bookingId: 1102484 })
      cy.task('stubGetCaseNotes', { prisonerNumber: 'G6123VU' })
      cy.task('stubGetSensitiveCaseNotesPage', 'G6123VU')
      caseNotesPage = visitCaseNotesPage()
    })

    it('Displays the delete link for the sensitive case note', () => {
      caseNotesPage.filterType().select('OMIC')
      caseNotesPage.filterApplyButton().click()

      caseNotesPage
        .caseNotesList()
        .get('.hmpps-case-note-card-list-item:nth-of-type(1) [data-qa="delete-case-note-link"]')
    })
  })
})

context('Incentive slips', () => {
  let caseNotesPage
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupComponentsData()
    cy.task('stubGetCaseNoteTypes')
    cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
    cy.task('stubInmateDetail', { bookingId: 1102484 })
    cy.task('stubGetCaseNotes', { prisonerNumber: 'G6123VU' })
  })

  context('Positive encouragement', () => {
    beforeEach(() => {
      cy.task('stubSingleCaseNoteWithType', { prisonerNumber: 'G6123VU', type: 'POS', subType: 'IEP_ENC' })
      caseNotesPage = visitCaseNotesPage()
    })

    it('Displays the delete link for the sensitive case note', () => {
      caseNotesPage.filterType().select('POS')
      caseNotesPage.filterApplyButton().click()
      caseNotesPage.encouragementPrintSlip().should('exist')
    })
  })

  context('Negative warning', () => {
    beforeEach(() => {
      cy.task('stubSingleCaseNoteWithType', { prisonerNumber: 'G6123VU', type: 'NEG', subType: 'IEP_WARN' })
      caseNotesPage = visitCaseNotesPage()
    })

    it('Displays the delete link for the sensitive case note', () => {
      caseNotesPage.filterType().select('NEG')
      caseNotesPage.filterApplyButton().click()
      caseNotesPage.warningPrintSlip().should('exist')
    })
  })
})

context('Case Notes Page Not Found', () => {
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
      cy.task('stubGetCaseNotes', { prisonerNumber: 'G6123VU' })
    })

    it('Displays Page Not Found', () => {
      cy.signIn({ failOnStatusCode: false, redirectPath: '/prisoner/G6123VU/case-notes' })
      Page.verifyOnPage(NotFoundPage)
    })
  })
})

context('Case Notes API Unavailable', () => {
  let caseNotesPage
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupComponentsData()
    cy.task('stubGetCaseNoteTypes')
    cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
    cy.task('stubInmateDetail', { bookingId: 1102484 })
    caseNotesPage = visitCaseNotesPage()
  })

  it('Display the API unavailable banner', () => {
    caseNotesPage.apiUnavailableBanner().should('be.visible')
    caseNotesPage.apiUnavailableBanner().should('contain', 'Case notes are currently unavailable')
  })
})
