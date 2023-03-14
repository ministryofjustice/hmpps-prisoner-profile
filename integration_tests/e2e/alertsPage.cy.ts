import Page from '../pages/page'
import AlertsPage from '../pages/alertsPage'

const visitAlertsPage = (): AlertsPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/alerts' })
  return Page.verifyOnPageWithTitle(AlertsPage, 'Active alerts')
}

const visitActiveAlertsPage = (): AlertsPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/alerts/active' })
  return Page.verifyOnPageWithTitle(AlertsPage, 'Active alerts')
}

const visitInactiveAlertsPage = (): AlertsPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/alerts/inactive' })
  return Page.verifyOnPageWithTitle(AlertsPage, 'Inactive alerts')
}

const visitEmptyAlertsPage = (): AlertsPage => {
  cy.signIn({ redirectPath: '/prisoner/A1234BC/alerts/active' })
  return Page.verifyOnPageWithTitle(AlertsPage, 'Active alerts')
}

context('Alerts Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.task('stubSignIn')
    cy.task('stubAuthUser')
  })

  it('Active alerts page is displayed by default', () => {
    visitAlertsPage()
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
  })
})
