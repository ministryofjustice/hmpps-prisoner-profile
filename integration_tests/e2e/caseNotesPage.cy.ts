import Page from '../pages/page'
import CaseNotesPage from '../pages/caseNotesPage'
import NotFoundPage from '../pages/notFoundPage'

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
    cy.setupUserAuth({
      roles: ['ROLE_GLOBAL_SEARCH'],
      caseLoads: [{ caseloadFunction: '', caseLoadId: 'MDI', currentlyActive: true, description: '', type: '' }],
    })
    cy.task('stubGetCaseNoteTypes')
  })

  context('Case Notes List', () => {
    let caseNotesPage: CaseNotesPage

    beforeEach(() => {
      cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
      cy.task('stubInmateDetail', 1102484)
      cy.task('stubPrisonerDetail', 'G6123VU')
      cy.task('stubGetCaseNotesUsage', 'G6123VU')
      cy.task('stubGetCaseNotes', 'G6123VU')
      caseNotesPage = visitCaseNotesPage()
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
    })
  })

  context('No Case Notes', () => {
    let caseNotesPage

    beforeEach(() => {
      cy.setupBannerStubs({ prisonerNumber: 'A1234BC' })
      cy.task('stubInmateDetail', 1234567)
      cy.task('stubPrisonerDetail', 'A1234BC')
      cy.task('stubGetCaseNotesUsage', 'A1234BC')
      cy.task('stubGetCaseNotes', 'A1234BC')
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
    })
  })

  // TODO investigate why this fails in pipeline but passes locally
  context.skip('Paging', () => {
    let caseNotesPage

    beforeEach(() => {
      cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
      cy.task('stubInmateDetail', 1102484)
      cy.task('stubPrisonerDetail', 'G6123VU')
      cy.task('stubGetCaseNotesUsage', 'G6123VU')
      cy.task('stubGetCaseNotes', 'G6123VU')
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
      cy.task('stubInmateDetail', 1102484)
      cy.task('stubPrisonerDetail', 'G6123VU')
      cy.task('stubGetCaseNotesUsage', 'G6123VU')
      cy.task('stubGetCaseNotes', 'G6123VU')
      cy.task('stubGetCaseNotesSorted', 'G6123VU')
      caseNotesPage = visitCaseNotesPage()
    })

    it('Displays the case notes and sorts results by Created (oldest)', () => {
      caseNotesPage.sort().invoke('attr', 'value').should('eq', '') // Default sort - Created (most recent)
      caseNotesPage.caseNotesListItem().first().contains('Created: Tuesday, 18 April 2023 at 17:15 by James Grant')

      caseNotesPage.sort().select('Created (oldest)')

      caseNotesPage.sort().invoke('attr', 'value').should('eq', 'creationDateTime,ASC')
      caseNotesPage.caseNotesListItem().first().contains('Created: Monday, 9 January 2023 at 11:29 by James T Kirk')
    })
  })

  context('Filtering', () => {
    let caseNotesPage

    beforeEach(() => {
      cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
      cy.task('stubInmateDetail', 1102484)
      cy.task('stubPrisonerDetail', 'G6123VU')
      cy.task('stubGetCaseNotesUsage', 'G6123VU')
      cy.task('stubGetCaseNotes', 'G6123VU')
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

context('Case Notes Page Not Found', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth({
      roles: ['ROLE_GLOBAL_SEARCH'],
      caseLoads: [{ caseloadFunction: '', caseLoadId: 'ZZZ', currentlyActive: true, description: '', type: '' }],
      activeCaseLoadId: 'ZZZ',
    })
    cy.task('stubGetCaseNoteTypes')
  })

  context('Page Not Found', () => {
    beforeEach(() => {
      cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
      cy.task('stubInmateDetail', 1102484)
      cy.task('stubPrisonerDetail', 'G6123VU')
      cy.task('stubGetCaseNotesUsage', 'G6123VU')
      cy.task('stubGetCaseNotes', 'G6123VU')
    })

    it('Displays Page Not Found', () => {
      cy.signIn({ redirectPath: '/prisoner/G6123VU/case-notes' })
      Page.verifyOnPage(NotFoundPage)
    })
  })
})
