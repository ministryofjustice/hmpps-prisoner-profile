import Page from '../pages/page'
import AlertsPage from '../pages/alertsPage'

const visitActiveAlertsPage = (): AlertsPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/alerts/active' })
  return Page.verifyOnPageWithTitle(AlertsPage, 'Active alerts')
}

const visitInactiveAlertsPage = (): AlertsPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/alerts/inactive?page=2' })
  return Page.verifyOnPageWithTitle(AlertsPage, 'Inactive alerts')
}

const visitEmptyAlertsPage = (): AlertsPage => {
  cy.signIn({ redirectPath: '/prisoner/A1234BC/alerts/active' })
  return Page.verifyOnPageWithTitle(AlertsPage, 'Active alerts')
}

context('Alerts Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
  })

  context('Active Alerts', () => {
    let alertsPage

    beforeEach(() => {
      cy.setupAlertsPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      alertsPage = visitActiveAlertsPage()
    })

    it('Displays the active alerts tab selected with correct count', () => {
      alertsPage.selectedTab().contains('a', 'Active (80 alerts)')
    })

    it('Displays the list with 20 items', () => {
      alertsPage.alertsList().children().should('have.length', 20)
    })

    it('Displays the pagination correctly', () => {
      alertsPage.paginationPreviousLink().should('not.exist')
      alertsPage.paginationCurrentPage().contains('1')
      alertsPage.paginationNextLink().should('exist')
      alertsPage.paginationHeaderPageLink().should('have.length', 3)
      alertsPage.paginationFooterPageLink().should('have.length', 3)
    })

    it('Displays the pagination summary correctly', () => {
      alertsPage.paginationSummaryHeader().contains('Showing 1 to 20 of 80 alerts')
      alertsPage.paginationSummaryFooter().contains('Showing 1 to 20 of 80 alerts')
    })
  })

  context('Inactive Alerts', () => {
    let alertsPage

    beforeEach(() => {
      cy.setupAlertsPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      alertsPage = visitInactiveAlertsPage()
    })

    it('Displays the inactive alerts tab selected with correct count', () => {
      alertsPage.selectedTab().contains('a', 'Inactive (80 alerts)')
    })

    it('Displays the list with 20 items', () => {
      alertsPage.alertsList().children().should('have.length', 20)
    })

    it('Displays the pagination correctly', () => {
      alertsPage.paginationPreviousLink().should('exist')
      alertsPage.paginationCurrentPage().contains('2')
      alertsPage.paginationNextLink().should('exist')
      alertsPage.paginationHeaderPageLink().should('have.length', 3)
      alertsPage.paginationFooterPageLink().should('have.length', 3)
    })

    it('Displays the pagination summary correctly', () => {
      alertsPage.paginationSummaryHeader().contains('Showing 21 to 40 of 80 alerts')
      alertsPage.paginationSummaryFooter().contains('Showing 21 to 40 of 80 alerts')
    })
  })

  context('No Active Alerts', () => {
    let alertsPage

    beforeEach(() => {
      cy.setupAlertsPageStubs({ prisonerNumber: 'A1234BC', bookingId: 1234567 })
      alertsPage = visitEmptyAlertsPage()
    })

    it('Displays the active alerts tab selected with correct count', () => {
      alertsPage.selectedTab().contains('a', 'Active (0 alerts)')
    })

    it('Displays the empty state message', () => {
      alertsPage.alertsList().should('not.exist')
      alertsPage.alertsEmptyState().should('contain', 'John Middle Names Saunders does not have any active alerts')
    })

    it('Displays no pagination or pagination summary', () => {
      alertsPage.paginationHeader().should('not.exist')
      alertsPage.paginationFooter().should('not.exist')
      alertsPage.paginationSummaryHeader().should('not.exist')
      alertsPage.paginationSummaryFooter().should('not.exist')
    })
  })

  // TODO investigate why this fails in pipeline but passes locally
  context.skip('Paging', () => {
    let alertsPage

    beforeEach(() => {
      cy.setupAlertsPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      alertsPage = visitActiveAlertsPage()
    })

    it('Moves to page 2 when clicking Next and back to page 1 when clicking Previous', () => {
      alertsPage.paginationCurrentPage().contains('1')
      alertsPage.paginationNextLink().first().click()
      alertsPage.paginationCurrentPage().contains('2')
      alertsPage.paginationSummaryHeader().contains('Showing 21 to 40 of 80 alerts')

      alertsPage.paginationPreviousLink().first().click()
      alertsPage.paginationCurrentPage().contains('1')
      alertsPage.paginationSummaryHeader().contains('Showing 1 to 20 of 80 alerts')
    })
  })

  context('Sorting', () => {
    let alertsPage

    beforeEach(() => {
      cy.setupAlertsPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      alertsPage = visitActiveAlertsPage()
    })

    it('Displays the active alerts tab and sorts results by Created (oldest)', () => {
      alertsPage.sort().invoke('attr', 'value').should('eq', '') // Default sort - Created (most recent)
      alertsPage.alertsListItem().first().contains('Created: 24 October 2022 by James T Kirk')

      alertsPage.sort().select('Created (oldest)')

      alertsPage.sort().invoke('attr', 'value').should('eq', 'dateCreated,ASC')
      alertsPage.alertsListItem().first().contains('Created: 10 June 2020 by Dom Bull')
    })
  })

  context('Filtering', () => {
    let alertsPage

    beforeEach(() => {
      cy.setupAlertsPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      alertsPage = visitActiveAlertsPage()
    })

    it('Displays the active alerts tab and filters results', () => {
      alertsPage.alertsList().children().should('have.length', 20)

      alertsPage.filterCheckbox().click()
      alertsPage.filterApplyButton().click()

      alertsPage.alertsList().children().should('have.length', 1)
    })
  })
})
