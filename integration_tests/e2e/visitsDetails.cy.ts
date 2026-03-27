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
      cy.setupComponentsData()
      cy.setupBannerStubs({ prisonerNumber, bookingId })
      cy.setupVisitsDetailsPageStubs({ prisonerNumber, bookingId })
      cy.signIn({ redirectPath: '/prisoner/G6123VU/visits-details' })
      page = Page.verifyOnPageWithTitle(VisitDetailsPage, 'John Saunders’ visits')
    })

    it('Displays the list with 20 items', () => {
      page.visits().should('have.length', 20)
    })

    it('Displays the pagination correctly', () => {
      page.pagedList.headerPreviousLink.should('not.exist')
      page.pagedList.headerCurrentPage.contains('1')
      page.pagedList.headerNextLink.should('exist')
      page.pagedList.headerPageLinks.should('have.length', 2)
      page.pagedList.footerPageLinks.should('have.length', 2)
    })

    it('Displays the pagination summary correctly', () => {
      page.pagedList.headerResults.contains('Showing 1 to 20 of 28 results')
      page.pagedList.footerResults.contains('Showing 1 to 20 of 28 results')
    })
  })

  context('With no visits', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupComponentsData()
      cy.setupBannerStubs({ prisonerNumber, bookingId })
      cy.setupVisitsDetailsPageStubs({ prisonerNumber, bookingId, visitsOverrides: [] })
      cy.signIn({ redirectPath: '/prisoner/G6123VU/visits-details' })
      page = Page.verifyOnPageWithTitle(VisitDetailsPage, 'John Saunders’ visits')
    })

    it('Displays the empty state', () => {
      page.visitsEmptyState().should('exist')
    })

    it('Displays no pagination or pagination summary', () => {
      page.pagedList.header.should('not.exist')
      page.pagedList.footer.should('not.exist')
    })
  })

  context('Filtering', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupComponentsData()
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

    it('Displays the visits and filters results', () => {
      page.visits().should('have.length', 20)
      page.filterType().select('Social')
      page.filterApplyButton().click()
      page.visits().should('have.length', 1)
    })
  })
})
