import VisitDetailsPage from '../pages/visitsDetails'
import Page from '../pages/page'
import { mockVisit } from '../../server/data/localMockData/pagedVisitsWithVisitors'

context('Visits details', () => {
  const prisonerNumber = 'G6123VU'
  const bookingId = 1102484
  let page: VisitDetailsPage

  context('With visits', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupBannerStubs({ prisonerNumber, bookingId })
      cy.setupVisitsDetailsPageStubs({ prisonerNumber, bookingId })
      cy.signIn({ redirectPath: '/prisoner/G6123VU/visits-details' })
      page = Page.verifyOnPageWithTitle(VisitDetailsPage, 'John Saunders’ visits')
    })

    it('Displays the list with 20 items', () => {
      page.visits().should('have.length', 20)
    })

    it('Displays the pagination correctly', () => {
      page.pagination.paginationPreviousLink().should('not.exist')
      page.pagination.paginationCurrentPage().contains('1')
      page.pagination.paginationNextLink().should('exist')
      page.pagination.paginationHeaderPageLink().should('have.length', 1)
      page.pagination.paginationFooterPageLink().should('have.length', 1)
    })

    it('Displays the pagination summary correctly', () => {
      page.pagination.paginationSummaryHeader().contains('Showing 1 to 20 of 28 results')
      page.pagination.paginationSummaryFooter().contains('Showing 1 to 20 of 28 results')
    })
  })

  context('With no visits', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupBannerStubs({ prisonerNumber, bookingId })
      cy.setupVisitsDetailsPageStubs({ prisonerNumber, bookingId, visitsOverrides: [] })
      cy.signIn({ redirectPath: '/prisoner/G6123VU/visits-details' })
      page = Page.verifyOnPageWithTitle(VisitDetailsPage, 'John Saunders’ visits')
    })

    it('Displays the empty state', () => {
      page.visitsEmptyState().should('exist')
    })

    it('Displays no pagination or pagination summary', () => {
      page.pagination.paginationHeader().should('not.exist')
      page.pagination.paginationFooter().should('not.exist')
      page.pagination.paginationSummaryHeader().should('not.exist')
      page.pagination.paginationSummaryFooter().should('not.exist')
      page.pagination.viewAllLink().should('not.exist')
    })
  })

  context('Filtering', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupBannerStubs({ prisonerNumber, bookingId })
      cy.setupVisitsDetailsPageStubs({ prisonerNumber, bookingId })
      cy.signIn({ redirectPath: '/prisoner/G6123VU/visits-details' })
      cy.task('stubVisitsWithVisitors', {
        bookingId,
        prisonerNumber,
        queryParams: { visitType: 'SCON' },
        visitsOverrides: [mockVisit({})],
      })
      page = Page.verifyOnPageWithTitle(VisitDetailsPage, 'John Saunders’ visits')
    })

    it('Displays the case notes and filters results', () => {
      page.visits().should('have.length', 20)
      page.filterType().select('Social')
      page.filterApplyButton().click()
      page.visits().should('have.length', 1)
    })
  })
})
