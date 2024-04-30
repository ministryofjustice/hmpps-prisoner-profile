import Page from '../pages/page'
import AlertsPage from '../pages/alertsPage'
import NotFoundPage from '../pages/notFoundPage'
import { Role } from '../../server/data/enums/role'
import AddMoreDetailsPage from '../pages/addMoreDetailsPage'

const visitAlertsPage = (): AlertsPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/alerts/active' })
  return Page.verifyOnPageWithTitle(AlertsPage, 'Active alerts')
}

context('Add More Details Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
    cy.setupUserAuth({ roles: [Role.GlobalSearch, Role.UpdateAlert] })
  })

  context('As a user with prisoner in their caseload', () => {
    let alertsPage: AlertsPage
    let addMoreDetailsPage: AddMoreDetailsPage

    beforeEach(() => {
      cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
      cy.setupAlertsPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
      cy.task('stubGetAlertTypes')
      alertsPage = visitAlertsPage()
    })

    context('Valid update', () => {
      beforeEach(() => {
        cy.task('stubAlertDetails')
        cy.task('stubUpdateAlert')
        alertsPage.addMoreDetailsLink().first().click()
        cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/2113/add-more-details')
        addMoreDetailsPage = new AddMoreDetailsPage('Add more details to alert')
      })

      it('should show correct alert details and save correctly', () => {
        addMoreDetailsPage.description().should('contain.text', 'Arsonist (XA)')
        addMoreDetailsPage.addedBy().should('contain.text', 'James T Kirk on 22 August 2011')
        addMoreDetailsPage.lastUpdatedBy().should('not.exist')
        addMoreDetailsPage.startDate().should('contain.text', '22 August 2011')
        addMoreDetailsPage.endDate().should('not.exist')
        addMoreDetailsPage.comments().type('Comments added')
        addMoreDetailsPage.updateButton().click()
        cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/active')
        alertsPage.successMessage().should('contain.text', 'Alert updated')
      })
    })

    context('Attempting to perform invalid update', () => {
      beforeEach(() => {
        cy.task('stubAlertDetailsExpires')
        cy.task('stubUpdateAlert')
        alertsPage.addMoreDetailsLink().first().click()
        cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/2113/add-more-details')
        addMoreDetailsPage = new AddMoreDetailsPage('Add more details to alert')
      })

      it('should show validation messages when no data is entered', () => {
        addMoreDetailsPage.lastUpdatedBy().should('contain.text', 'Luke Skywalker on 14 May 2020')
        addMoreDetailsPage.endDate().should('contain.text', '23 August 2199')
        addMoreDetailsPage.comments().clear()
        addMoreDetailsPage.updateButton().click()
        cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/2113/add-more-details')
        addMoreDetailsPage.errorBlock().should('exist')
        addMoreDetailsPage.errorBlock().should('contain.text', 'Enter your comments on this alert')
      })

      it('should show validation messages when invalid data is entered', () => {
        addMoreDetailsPage
          .comments()
          .clear()
          .invoke(
            'val',
            'XTG5Sujg6UchJnaaet5uq7wdUwxmtDo9EuGc3mHDtLeuDbFtZZ2dRfdQhA47hTYHZYO8bgDcxlIT1GvNxnSmVxH7ZGKEHo1C5jG6UmkBYOpw1LG9WJsGdgdOZjb4K1MEH0z2h0FfNeWkkl1KMiP10drFVyFK9SaD9UKdDsMAUjTtaIEBpBXeUuRw1coP0eLJfDtiPyqUZKhz5WE8aJru8w6gu6kWRIexF2njyDvWvxrQmpZKjm4Ys1Lzhx0nPPylgA2AxAkrszE8ZqAqvKvnLBagtPVszCux8NOrOqTBdOCi8KGVZtpdrTcPyJpZHOPiQUR59p8VFGGlsvMU8YXK0JxPlSyVsUEQmwaeYF3nFZQiREjefY0BzrN04b4Zpu4JxMdlXOE4CS9LJlbc2pOhpsJ5KuPzYomACGR9SuBFWIl6MDotFN7DZ7nxKePtcI2Z3CvnZpJNFDgr8opEKzWaBPyJoYkLXAM0gD6pTgaxTviHnfHqKbrGNWY2wAJII9Mbo1t6GCGn6ySpWeN3wcnNWDf77vSkHDuU0f6fhTrzhIroV8gsEceXwwUrT6Vq76c5CXQnnMV40LXwJtnVuQG4FVC4qZ0lgt473SbCp1RxQJfsJoMnpF09JZwwYLgYJWrKKfs3Ar2In7nPJRMBDK6ICNM91z8YTn0D35D70a1z0wrlV7XSxtptt3GkoxR9J1iEzImclgZLxhibX2grRW623ut4L9INNffKM3pXGNMzwhMgzC4ySElyNmyn8c3YgYBsg4Xu2yL3PiBWWKNBe9F0z7GFzYGsm4h2rMznUyU4spvdsTigHkdZKWdQ2KM8ZqTckyCMgPtJiOlNU6bjxX1Ip4s2dJof5X8wRM1wfgs6WfjttAcVfM2EQxgI12Ok0aDbhXqP7g62ifurJiUPqVHc2FpDI53nyN6CCdYcqyhzDX4gNyefz7xPdCihzCk8MlBAiFeTFQNTtlKb0TkbdXJA4vFJaBksickkP1JoeKlmF',
          )
        addMoreDetailsPage.updateButton().click()
        cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/2113/add-more-details')
        addMoreDetailsPage.errorBlock().should('exist')
        addMoreDetailsPage.errorBlock().should('contain.text', 'Enter your comments using 1,000 characters or less')
      })
    })

    context('Alert is locked in NOMIS when updating', () => {
      beforeEach(() => {
        cy.task('stubAlertDetails')
        cy.task('stubUpdateAlertLocked')
        alertsPage.addMoreDetailsLink().first().click()
        cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/2113/add-more-details')
        addMoreDetailsPage = new AddMoreDetailsPage('Add more details to alert')
      })

      it('should show error message', () => {
        addMoreDetailsPage.comments().type('Attempted new comment')
        addMoreDetailsPage.updateButton().click()
        cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/2113/add-more-details')
        addMoreDetailsPage.errorBlock().should('exist')
        addMoreDetailsPage
          .errorBlock()
          .should(
            'contain.text',
            'This alert cannot be updated because someone else has opened it in NOMIS. Try again later.',
          )
      })
    })
  })

  context('As a user without prisoner in their caseload', () => {
    beforeEach(() => {
      cy.task('reset')
      cy.setupUserAuth({
        roles: [Role.GlobalSearch],
        caseLoads: [{ caseloadFunction: '', caseLoadId: 'ZZZ', currentlyActive: true, description: '', type: '' }],
        activeCaseLoadId: 'ZZZ',
      })
      cy.task('stubGetAlertTypes')
    })

    context('Page Not Found', () => {
      beforeEach(() => {
        cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
        cy.task('stubInmateDetail', { bookingId: 1102484 })
        cy.task('stubPrisonerDetail', 'G6123VU')
      })

      it('Displays Page Not Found', () => {
        cy.signIn({ failOnStatusCode: false, redirectPath: '/prisoner/G6123VU/alerts/2113/add-more-details' })
        Page.verifyOnPage(NotFoundPage)
      })
    })
  })
})
