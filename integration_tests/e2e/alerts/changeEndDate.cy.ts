import Page from '../../pages/page'
import AlertsPage from '../../pages/alertsPage'
import NotFoundPage from '../../pages/notFoundPage'
import { Role } from '../../../server/data/enums/role'
import ChangeEndDatePage from '../../pages/changeEndDatePage'

const visitAlertsPage = (): AlertsPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/alerts/active' })
  return Page.verifyOnPageWithTitle(AlertsPage, 'Active alerts')
}

context('Change End Date Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
    cy.setupUserAuth({ roles: [Role.GlobalSearch, Role.UpdateAlert] })
  })

  context('Non-Alerts API enabled prison', () => {
    context('As a user with prisoner in their caseload', () => {
      let alertsPage: AlertsPage
      let changeEndDatePage: ChangeEndDatePage

      beforeEach(() => {
        cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
        cy.setupPrisonApiAlertsPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
        cy.task('stubGetPrisonApiAlertTypes')
        alertsPage = visitAlertsPage()
      })

      context('Valid update closing alert in future', () => {
        beforeEach(() => {
          cy.task('stubPrisonApiAlertDetails')
          cy.task('stubUpdatePrisonApiAlert')
          alertsPage.changeEndDateLink().first().click()
          cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/2112/change-end-date')
          changeEndDatePage = new ChangeEndDatePage('Change or remove alert end date')
        })

        it('should show correct alert details and save correctly', () => {
          changeEndDatePage.description().should('contain.text', 'Arsonist (XA)')
          changeEndDatePage.addedBy().should('contain.text', 'James T Kirk on 22 August 2011')
          changeEndDatePage.lastUpdatedBy().should('not.exist')
          changeEndDatePage.startDate().should('contain.text', '22 August 2011')
          changeEndDatePage.endDate().should('not.exist')
          changeEndDatePage.comments().type('Comments added')
          changeEndDatePage.changeEndDateRadio().click()
          changeEndDatePage.changeEndDateSection().should('be.visible')
          changeEndDatePage.endDateField().type('01/01/2199')
          changeEndDatePage.confirmButton().click()
          cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/active')
          alertsPage.successMessage().should('contain.text', 'Alert updated')
        })
      })

      context('Valid update removing end date', () => {
        beforeEach(() => {
          cy.task('stubPrisonApiAlertDetails')
          cy.task('stubUpdatePrisonApiAlert')
          alertsPage.changeEndDateLink().first().click()
          cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/2112/change-end-date')
          changeEndDatePage = new ChangeEndDatePage('Change or remove alert end date')
        })

        it('should show correct alert details and save correctly', () => {
          changeEndDatePage.description().should('contain.text', 'Arsonist (XA)')
          changeEndDatePage.addedBy().should('contain.text', 'James T Kirk on 22 August 2011')
          changeEndDatePage.lastUpdatedBy().should('not.exist')
          changeEndDatePage.startDate().should('contain.text', '22 August 2011')
          changeEndDatePage.endDate().should('not.exist')
          changeEndDatePage.comments().type('Comments added')
          changeEndDatePage.removeEndDateRadio().click()
          changeEndDatePage.confirmButton().click()
          cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/active')
          alertsPage.successMessage().should('contain.text', 'Alert updated')
        })
      })

      context('Attempting to perform invalid update', () => {
        beforeEach(() => {
          cy.task('stubPrisonApiAlertDetailsExpires')
          cy.task('stubUpdatePrisonApiAlert')
          alertsPage.changeEndDateLink().first().click()
          cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/2112/change-end-date')
          changeEndDatePage = new ChangeEndDatePage('Change or remove alert end date')
        })

        it('should show validation messages when no data is entered', () => {
          changeEndDatePage.lastUpdatedBy().should('contain.text', 'Luke Skywalker on 14 May 2020')
          changeEndDatePage.endDate().should('contain.text', '23 August 2199')
          changeEndDatePage.comments().clear()
          changeEndDatePage.confirmButton().click()
          cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/2112/change-end-date')
          changeEndDatePage.errorBlock().should('exist')
          changeEndDatePage.errorBlock().should('contain.text', 'Enter your comments on this alert')
        })

        it('should show validation messages when invalid data is entered', () => {
          changeEndDatePage
            .comments()
            .clear()
            .invoke(
              'val',
              'XTG5Sujg6UchJnaaet5uq7wdUwxmtDo9EuGc3mHDtLeuDbFtZZ2dRfdQhA47hTYHZYO8bgDcxlIT1GvNxnSmVxH7ZGKEHo1C5jG6UmkBYOpw1LG9WJsGdgdOZjb4K1MEH0z2h0FfNeWkkl1KMiP10drFVyFK9SaD9UKdDsMAUjTtaIEBpBXeUuRw1coP0eLJfDtiPyqUZKhz5WE8aJru8w6gu6kWRIexF2njyDvWvxrQmpZKjm4Ys1Lzhx0nPPylgA2AxAkrszE8ZqAqvKvnLBagtPVszCux8NOrOqTBdOCi8KGVZtpdrTcPyJpZHOPiQUR59p8VFGGlsvMU8YXK0JxPlSyVsUEQmwaeYF3nFZQiREjefY0BzrN04b4Zpu4JxMdlXOE4CS9LJlbc2pOhpsJ5KuPzYomACGR9SuBFWIl6MDotFN7DZ7nxKePtcI2Z3CvnZpJNFDgr8opEKzWaBPyJoYkLXAM0gD6pTgaxTviHnfHqKbrGNWY2wAJII9Mbo1t6GCGn6ySpWeN3wcnNWDf77vSkHDuU0f6fhTrzhIroV8gsEceXwwUrT6Vq76c5CXQnnMV40LXwJtnVuQG4FVC4qZ0lgt473SbCp1RxQJfsJoMnpF09JZwwYLgYJWrKKfs3Ar2In7nPJRMBDK6ICNM91z8YTn0D35D70a1z0wrlV7XSxtptt3GkoxR9J1iEzImclgZLxhibX2grRW623ut4L9INNffKM3pXGNMzwhMgzC4ySElyNmyn8c3YgYBsg4Xu2yL3PiBWWKNBe9F0z7GFzYGsm4h2rMznUyU4spvdsTigHkdZKWdQ2KM8ZqTckyCMgPtJiOlNU6bjxX1Ip4s2dJof5X8wRM1wfgs6WfjttAcVfM2EQxgI12Ok0aDbhXqP7g62ifurJiUPqVHc2FpDI53nyN6CCdYcqyhzDX4gNyefz7xPdCihzCk8MlBAiFeTFQNTtlKb0TkbdXJA4vFJaBksickkP1JoeKlmF',
            )
          changeEndDatePage.confirmButton().click()
          cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/2112/change-end-date')
          changeEndDatePage.errorBlock().should('exist')
          changeEndDatePage.errorBlock().should('contain.text', 'Enter your comments using 1,000 characters or less')
        })
      })

      context('Alert is locked in NOMIS when updating', () => {
        beforeEach(() => {
          cy.task('stubPrisonApiAlertDetails')
          cy.task('stubUpdatePrisonApiAlertLocked')
          alertsPage.changeEndDateLink().first().click()
          cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/2112/change-end-date')
          changeEndDatePage = new ChangeEndDatePage('Change or remove alert end date')
        })

        it('should show error message', () => {
          changeEndDatePage.comments().type('Attempted new comment')
          changeEndDatePage.changeEndDateRadio().click()
          changeEndDatePage.changeEndDateSection().should('be.visible')
          changeEndDatePage.endDateField().type('01/01/2199')
          changeEndDatePage.confirmButton().click()
          cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/2112/change-end-date')
          changeEndDatePage.errorBlock().should('exist')
          changeEndDatePage
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
        })
        cy.task('stubGetPrisonApiAlertTypes')
      })

      context('Page Not Found', () => {
        beforeEach(() => {
          cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
          cy.task('stubInmateDetail', { bookingId: 1102484 })
          cy.task('stubPrisonerDetail', 'G6123VU')
        })

        it('Displays Page Not Found', () => {
          cy.signIn({ failOnStatusCode: false, redirectPath: '/prisoner/G6123VU/alerts/2112/change-end-date' })
          Page.verifyOnPage(NotFoundPage)
        })
      })
    })
  })

  context('Alerts API enabled prison', () => {
    context('As a user with prisoner in their caseload', () => {
      let alertsPage: AlertsPage
      let changeEndDatePage: ChangeEndDatePage

      beforeEach(() => {
        cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
        cy.setupAlertsPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
        cy.task('stubActiveAlerts')
        cy.task('stubGetAlertTypes')
        alertsPage = visitAlertsPage()
      })

      context('Valid update closing alert in future', () => {
        beforeEach(() => {
          cy.task('stubAlertDetails')
          cy.task('stubUpdateAlert')
          alertsPage.changeEndDateLink().first().click()
          cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/2112/change-end-date')
          changeEndDatePage = new ChangeEndDatePage('Change or remove alert end date')
        })

        it('should show correct alert details and save correctly', () => {
          changeEndDatePage.description().should('contain.text', 'Arsonist (XA)')
          changeEndDatePage.addedBy().should('contain.text', 'James T Kirk on 22 August 2011')
          changeEndDatePage.lastUpdatedBy().should('not.exist')
          changeEndDatePage.startDate().should('contain.text', '22 August 2011')
          changeEndDatePage.endDate().should('not.exist')
          changeEndDatePage.comments().type('Comments added')
          changeEndDatePage.changeEndDateRadio().click()
          changeEndDatePage.changeEndDateSection().should('be.visible')
          changeEndDatePage.endDateField().type('01/01/2199')
          changeEndDatePage.confirmButton().click()
          cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/active')
          alertsPage.successMessage().should('contain.text', 'Alert updated')
        })
      })

      context('Valid update removing end date', () => {
        beforeEach(() => {
          cy.task('stubAlertDetails')
          cy.task('stubUpdateAlert')
          alertsPage.changeEndDateLink().first().click()
          cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/2112/change-end-date')
          changeEndDatePage = new ChangeEndDatePage('Change or remove alert end date')
        })

        it('should show correct alert details and save correctly', () => {
          changeEndDatePage.description().should('contain.text', 'Arsonist (XA)')
          changeEndDatePage.addedBy().should('contain.text', 'James T Kirk on 22 August 2011')
          changeEndDatePage.lastUpdatedBy().should('not.exist')
          changeEndDatePage.startDate().should('contain.text', '22 August 2011')
          changeEndDatePage.endDate().should('not.exist')
          changeEndDatePage.comments().type('Comments added')
          changeEndDatePage.removeEndDateRadio().click()
          changeEndDatePage.confirmButton().click()
          cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/active')
          alertsPage.successMessage().should('contain.text', 'Alert updated')
        })
      })

      context('Attempting to perform invalid update', () => {
        beforeEach(() => {
          cy.task('stubAlertDetailsExpires')
          cy.task('stubUpdateAlert')
          alertsPage.changeEndDateLink().first().click()
          cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/2112/change-end-date')
          changeEndDatePage = new ChangeEndDatePage('Change or remove alert end date')
        })

        it('should show validation messages when no data is entered', () => {
          changeEndDatePage.lastUpdatedBy().should('contain.text', 'Luke Skywalker on 14 May 2020')
          changeEndDatePage.endDate().should('contain.text', '23 August 2199')
          changeEndDatePage.comments().clear()
          changeEndDatePage.confirmButton().click()
          cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/2112/change-end-date')
          changeEndDatePage.errorBlock().should('exist')
          changeEndDatePage.errorBlock().should('contain.text', 'Enter your comments on this alert')
        })

        it('should show validation messages when invalid data is entered', () => {
          changeEndDatePage
            .comments()
            .clear()
            .invoke(
              'val',
              'XTG5Sujg6UchJnaaet5uq7wdUwxmtDo9EuGc3mHDtLeuDbFtZZ2dRfdQhA47hTYHZYO8bgDcxlIT1GvNxnSmVxH7ZGKEHo1C5jG6UmkBYOpw1LG9WJsGdgdOZjb4K1MEH0z2h0FfNeWkkl1KMiP10drFVyFK9SaD9UKdDsMAUjTtaIEBpBXeUuRw1coP0eLJfDtiPyqUZKhz5WE8aJru8w6gu6kWRIexF2njyDvWvxrQmpZKjm4Ys1Lzhx0nPPylgA2AxAkrszE8ZqAqvKvnLBagtPVszCux8NOrOqTBdOCi8KGVZtpdrTcPyJpZHOPiQUR59p8VFGGlsvMU8YXK0JxPlSyVsUEQmwaeYF3nFZQiREjefY0BzrN04b4Zpu4JxMdlXOE4CS9LJlbc2pOhpsJ5KuPzYomACGR9SuBFWIl6MDotFN7DZ7nxKePtcI2Z3CvnZpJNFDgr8opEKzWaBPyJoYkLXAM0gD6pTgaxTviHnfHqKbrGNWY2wAJII9Mbo1t6GCGn6ySpWeN3wcnNWDf77vSkHDuU0f6fhTrzhIroV8gsEceXwwUrT6Vq76c5CXQnnMV40LXwJtnVuQG4FVC4qZ0lgt473SbCp1RxQJfsJoMnpF09JZwwYLgYJWrKKfs3Ar2In7nPJRMBDK6ICNM91z8YTn0D35D70a1z0wrlV7XSxtptt3GkoxR9J1iEzImclgZLxhibX2grRW623ut4L9INNffKM3pXGNMzwhMgzC4ySElyNmyn8c3YgYBsg4Xu2yL3PiBWWKNBe9F0z7GFzYGsm4h2rMznUyU4spvdsTigHkdZKWdQ2KM8ZqTckyCMgPtJiOlNU6bjxX1Ip4s2dJof5X8wRM1wfgs6WfjttAcVfM2EQxgI12Ok0aDbhXqP7g62ifurJiUPqVHc2FpDI53nyN6CCdYcqyhzDX4gNyefz7xPdCihzCk8MlBAiFeTFQNTtlKb0TkbdXJA4vFJaBksickkP1JoeKlmF',
            )
          changeEndDatePage.confirmButton().click()
          cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/2112/change-end-date')
          changeEndDatePage.errorBlock().should('exist')
          changeEndDatePage.errorBlock().should('contain.text', 'Enter your comments using 1,000 characters or less')
        })
      })
    })

    context('As a user without prisoner in their caseload', () => {
      beforeEach(() => {
        cy.task('reset')
        cy.setupUserAuth({
          roles: [Role.GlobalSearch],
          caseLoads: [{ caseloadFunction: '', caseLoadId: 'ZZZ', currentlyActive: true, description: '', type: '' }],
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
          cy.signIn({ failOnStatusCode: false, redirectPath: '/prisoner/G6123VU/alerts/2112/change-end-date' })
          Page.verifyOnPage(NotFoundPage)
        })
      })
    })
  })
})
