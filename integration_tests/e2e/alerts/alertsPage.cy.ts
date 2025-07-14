import Page from '../../pages/page'
import AlertsPage from '../../pages/alertsPage'
import { Role } from '../../../server/data/enums/role'
import { permissionsTests } from '../permissionsTests'
import NotFoundPage from '../../pages/notFoundPage'
import { emptyAlertsMock } from '../../../server/data/localMockData/pagedAlertsMock'

const visitActiveAlertsPage = ({ failOnStatusCode = true } = {}) => {
  cy.signIn({ failOnStatusCode, redirectPath: '/prisoner/G6123VU/alerts/active' })
}

const visitInactiveAlertsPage = () => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/alerts/inactive?page=2' })
}

const visitEmptyAlertsPage = () => {
  cy.signIn({ redirectPath: '/prisoner/A1234BC/alerts/active' })
}

context('Alerts Page - Permissions', () => {
  context('Active alerts', () => {
    const visitPage = prisonerDataOverrides => {
      cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
      cy.setupAlertsPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484, prisonerDataOverrides })
      cy.task('stubActiveAlerts')
      visitActiveAlertsPage({ failOnStatusCode: false })
    }

    permissionsTests({
      prisonerNumber: 'G6123VU',
      visitPage,
      pageWithTitleToDisplay: { page: AlertsPage, title: 'Active alerts' },
    })
  })
})

context('Alerts API enabled prison', () => {
  context('Alerts Page - User does not have Update Alerts role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth()
      cy.setupComponentsData()
      cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
    })

    context('Active Alerts', () => {
      let alertsPage

      beforeEach(() => {
        cy.setupAlertsPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
        cy.task('stubActiveAlerts')
        visitActiveAlertsPage()
        alertsPage = Page.verifyOnPageWithTitle(AlertsPage, 'Active alerts')
      })

      it('should contain elements with CSS classes linked to Google Analytics', () => {
        cy.get('.info__links').should('exist')
        cy.get('.hmpps-profile-tab-links').should('exist')
      })

      it('Does not display the add alert button', () => {
        alertsPage.addAlertButton().should('not.exist')
      })

      it('Does not display the add more details or close alert link for each alert', () => {
        alertsPage.addMoreDetailsLink().should('not.exist')
        alertsPage.closeAlertLink().should('not.exist')
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
        alertsPage.viewAllLink().should('exist')
      })
    })

    context('Inactive Alerts', () => {
      let alertsPage

      beforeEach(() => {
        cy.setupAlertsPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
        cy.task('stubInactiveAlerts')
        visitInactiveAlertsPage()
        alertsPage = Page.verifyOnPageWithTitle(AlertsPage, 'Inactive alerts')
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
        alertsPage.viewAllLink().should('exist')
      })
    })

    context('No Active Alerts', () => {
      let alertsPage

      beforeEach(() => {
        cy.setupAlertsPageStubs({ prisonerNumber: 'A1234BC', bookingId: 1234567 })
        cy.task('stubActiveAlerts', emptyAlertsMock)
        cy.setupBannerStubs({ prisonerNumber: 'G6123VU', bookingId: 1234567 })
        cy.task('stubGetAlerts', emptyAlertsMock)
        visitEmptyAlertsPage()
        alertsPage = Page.verifyOnPageWithTitle(AlertsPage, 'Active alerts')
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
        alertsPage.viewAllLink().should('not.exist')
      })
    })

    context('Paging', () => {
      let alertsPage

      beforeEach(() => {
        cy.setupAlertsPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
        cy.task('stubActiveAlerts')
        cy.task('stubActiveAlertsPage2')
        visitActiveAlertsPage()
        alertsPage = Page.verifyOnPageWithTitle(AlertsPage, 'Active alerts')
      })

      it('Moves to page 2 when clicking Next and back to page 1 when clicking Previous', () => {
        alertsPage.paginationCurrentPage().contains('1')
        alertsPage.paginationNextLink().first().click()
        cy.location('href').should('contain', 'page=2')
        alertsPage.paginationCurrentPage().contains('2')
        alertsPage.paginationSummaryHeader().contains('Showing 21 to 40 of 80 alerts')

        alertsPage.paginationPreviousLink().first().click()
        cy.location('href').should('contain', 'page=1')
        alertsPage.paginationCurrentPage().contains('1')
        alertsPage.paginationSummaryHeader().contains('Showing 1 to 20 of 80 alerts')
      })
    })

    context('Sorting', () => {
      let alertsPage

      beforeEach(() => {
        cy.setupAlertsPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
        cy.task('stubActiveAlerts')
        cy.task('stubActiveAlertsSorted')
        visitActiveAlertsPage()
        alertsPage = Page.verifyOnPageWithTitle(AlertsPage, 'Active alerts')
      })

      it('Displays the active alerts tab and sorts results by Start date (oldest)', () => {
        alertsPage.sort().invoke('attr', 'value').should('eq', 'dateCreated,DESC') // Default sort - Start date (most recent)
        alertsPage.alertsListItem().first().contains('Start date: 24 October 2022 by James T Kirk')

        alertsPage.sort().select('Start date (oldest)')

        alertsPage.sort().invoke('attr', 'value').should('eq', 'dateCreated,ASC')
        alertsPage.alertsListItem().first().contains('Start date: 10 June 2020 by Dom Bull')
      })
    })

    context('Filtering', () => {
      let alertsPage

      beforeEach(() => {
        cy.setupAlertsPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
        cy.task('stubActiveAlerts')
        cy.task('stubActiveAlertsFiltered')
        visitActiveAlertsPage()
        alertsPage = Page.verifyOnPageWithTitle(AlertsPage, 'Active alerts')
      })

      it('Displays the active alerts tab and filters results', () => {
        alertsPage.alertsList().children().should('have.length', 20)

        alertsPage.filterCheckbox().click({ force: true })
        alertsPage.filterApplyButton().click()

        alertsPage.alertsList().children().should('have.length', 1)
      })
    })
  })

  context('Alerts Page - User has Update Alert role', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({ roles: [Role.PrisonUser, Role.UpdateAlert] })
      cy.setupComponentsData()
      cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
      cy.task('stubActiveAlerts')
      cy.setupAlertsPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      visitActiveAlertsPage()
      alertsPage = Page.verifyOnPageWithTitle(AlertsPage, 'Active alerts')
    })

    let alertsPage

    it('Displays the add alert button', () => {
      alertsPage.addAlertButton()
    })

    it('Displays the add more details and close alert links for each alert', () => {
      alertsPage.addMoreDetailsLink().should('be.visible')
      alertsPage.closeAlertLink().should('be.visible')
    })

    it('Alert page should go to 404 not found page', () => {
      cy.visit(`/prisoner/asudhsdudhid/alerts/active`, { failOnStatusCode: false })
      Page.verifyOnPage(NotFoundPage)
    })
  })
})

context('Alerts API Unavailable', () => {
  let alertsPage
  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupComponentsData()
    cy.task('stubPrisonerData', { prisonerNumber: 'G6123VU' })
    cy.task('stubEventsForProfileImage', 'G6123VU')
    cy.task('stubAssessments', 1102484)
    cy.task('stubInmateDetail', { bookingId: 1102484 })
    cy.task('stubGetCurrentCsip', 'G6123VU')
    cy.task('stubGetLatestArrivalDate', '2024-01-01')
    visitActiveAlertsPage()
    alertsPage = Page.verifyOnPageWithTitle(AlertsPage, 'Alerts')
  })

  it('Display the API unavailable banner in the profile banner', () => {
    alertsPage.bannerApiUnavailableBanner().should('be.visible')
    alertsPage.bannerApiUnavailableBanner().should('contain', 'Alerts are currently unavailable')
  })

  it('Display the API unavailable banner in the page', () => {
    alertsPage.pageApiUnavailableBanner().should('be.visible')
    alertsPage.pageApiUnavailableBanner().should('contain', 'Alerts are currently unavailable')
  })
})
