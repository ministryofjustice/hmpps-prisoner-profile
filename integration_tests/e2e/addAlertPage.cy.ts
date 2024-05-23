import Page from '../pages/page'
import AlertsPage from '../pages/alertsPage'
import NotFoundPage from '../pages/notFoundPage'
import { Role } from '../../server/data/enums/role'
import AddAlertPage from '../pages/addAlertPage'
import { formatDate } from '../../server/utils/dateHelpers'

const visitAlertsPage = (): AlertsPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/alerts/active' })
  return Page.verifyOnPageWithTitle(AlertsPage, 'Active alerts')
}

context('Add Alert Page', () => {
  beforeEach(() => {
    cy.task('reset')
    cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
    cy.setupUserAuth({ roles: [Role.GlobalSearch, Role.UpdateAlert] })
  })

  context('Non-Alerts API enabled prison', () => {
    context('As a user with prisoner in their caseload', () => {
      let alertsPage: AlertsPage
      let addAlertPage: AddAlertPage

      beforeEach(() => {
        cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
        cy.setupPrisonApiAlertsPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
        cy.task('stubGetPrisonApiAlertTypes')
        cy.task('stubCreatePrisonApiAlert')
        alertsPage = visitAlertsPage()
        alertsPage.addAlertButton().click()
        cy.location('pathname').should('eq', '/prisoner/G6123VU/add-alert')
        addAlertPage = new AddAlertPage('Add an alert')
      })

      context('Adding a valid alert', () => {
        it('should show correct prisoner number and default field values', () => {
          addAlertPage.typeField().contains('Choose alert type')
          addAlertPage.subTypeField().contains('Choose alert code')
          addAlertPage.textField().should('have.value', '')
          addAlertPage.dateField().should('have.value', formatDate(new Date().toISOString(), 'short'))
        })

        it('should use the right url for back and cancel', () => {
          addAlertPage.backLink().should('have.attr', 'href').and('contain', '/prisoner/G6123VU/alerts/active')
          addAlertPage.cancelButton().should('have.attr', 'href').and('contain', '/prisoner/G6123VU/alerts/active')
        })

        it('should save successfully when valid data is entered', () => {
          addAlertPage.typeField().select('AAA')
          addAlertPage.typeField().invoke('val').should('eq', 'A')
          addAlertPage.subTypeField().children().should('have.length', '2')
          addAlertPage.subTypeField().select('AAA111')
          addAlertPage.subTypeField().invoke('val').should('eq', 'A1')
          addAlertPage.textField().type('This is a test')
          addAlertPage.saveButton().click()
          cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/active')
          alertsPage.successMessage().should('contain.text', 'Alert added')
        })
      })

      context('Attempting to add an invalid alert', () => {
        it('should show validation messages when no data is entered', () => {
          addAlertPage.dateField().clear()
          addAlertPage.saveButton().click()
          cy.location('pathname').should('eq', '/prisoner/G6123VU/add-alert')
          addAlertPage.errorBlock().should('exist')
          addAlertPage.errorBlock().should('contain.text', 'Select the alert type')
          addAlertPage.errorBlock().should('contain.text', 'Select the alert code')
          addAlertPage.errorBlock().should('contain.text', 'Enter why you are creating this alert')
          addAlertPage.errorBlock().should('contain.text', 'Select the alert start date')
          addAlertPage.typeField().should('have.class', 'govuk-select--error')
          addAlertPage.subTypeField().should('have.class', 'govuk-select--error')
        })

        it('should show validation messages when invalid data is entered', () => {
          addAlertPage.dateField().clear().type('abc')
          addAlertPage.saveButton().click()
          cy.location('pathname').should('eq', '/prisoner/G6123VU/add-alert')
          addAlertPage.errorBlock().should('exist')
          addAlertPage.errorBlock().should('contain.text', 'Select the alert type')
          addAlertPage.errorBlock().should('contain.text', 'Select the alert code')
          addAlertPage.errorBlock().should('contain.text', 'Enter why you are creating this alert')
          addAlertPage
            .errorBlock()
            .should('contain.text', 'Enter a real date in the format DD/MM/YYYY - for example, 27/03/2023')
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
          cy.signIn({ failOnStatusCode: false, redirectPath: '/prisoner/G6123VU/add-alert' })
          Page.verifyOnPage(NotFoundPage)
        })
      })
    })
  })

  context('Alerts API enabled prison', () => {
    context('As a user with prisoner in their caseload', () => {
      let alertsPage: AlertsPage
      let addAlertPage: AddAlertPage

      beforeEach(() => {
        cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
        cy.setupAlertsPageStubs({ prisonerNumber: 'G6123VU', bookingId: 1102484 })
        cy.task('stubGetAlertTypes')
        cy.task('stubCreateAlert')
        alertsPage = visitAlertsPage()
        alertsPage.addAlertButton().click()
        cy.location('pathname').should('eq', '/prisoner/G6123VU/add-alert')
        addAlertPage = new AddAlertPage('Add an alert')
      })

      context('Adding a valid alert', () => {
        it('should show correct prisoner number and default field values', () => {
          addAlertPage.typeField().contains('Choose alert type')
          addAlertPage.subTypeField().contains('Choose alert code')
          addAlertPage.textField().should('have.value', '')
          addAlertPage.dateField().should('have.value', formatDate(new Date().toISOString(), 'short'))
        })

        it('should use the right url for back and cancel', () => {
          addAlertPage.backLink().should('have.attr', 'href').and('contain', '/prisoner/G6123VU/alerts/active')
          addAlertPage.cancelButton().should('have.attr', 'href').and('contain', '/prisoner/G6123VU/alerts/active')
        })

        it('should save successfully when valid data is entered', () => {
          addAlertPage.typeField().select('AAA')
          addAlertPage.typeField().invoke('val').should('eq', 'A')
          addAlertPage.subTypeField().children().should('have.length', '2')
          addAlertPage.subTypeField().select('AAA111')
          addAlertPage.subTypeField().invoke('val').should('eq', 'A1')
          addAlertPage.textField().type('This is a test')
          addAlertPage.saveButton().click()
          cy.location('pathname').should('eq', '/prisoner/G6123VU/alerts/active')
          alertsPage.successMessage().should('contain.text', 'Alert added')
        })
      })

      context('Attempting to add an invalid alert', () => {
        it('should show validation messages when no data is entered', () => {
          addAlertPage.dateField().clear()
          addAlertPage.saveButton().click()
          cy.location('pathname').should('eq', '/prisoner/G6123VU/add-alert')
          addAlertPage.errorBlock().should('exist')
          addAlertPage.errorBlock().should('contain.text', 'Select the alert type')
          addAlertPage.errorBlock().should('contain.text', 'Select the alert code')
          addAlertPage.errorBlock().should('contain.text', 'Enter why you are creating this alert')
          addAlertPage.errorBlock().should('contain.text', 'Select the alert start date')
          addAlertPage.typeField().should('have.class', 'govuk-select--error')
          addAlertPage.subTypeField().should('have.class', 'govuk-select--error')
        })

        it('should show validation messages when invalid data is entered', () => {
          addAlertPage.dateField().clear().type('abc')
          addAlertPage.saveButton().click()
          cy.location('pathname').should('eq', '/prisoner/G6123VU/add-alert')
          addAlertPage.errorBlock().should('exist')
          addAlertPage.errorBlock().should('contain.text', 'Select the alert type')
          addAlertPage.errorBlock().should('contain.text', 'Select the alert code')
          addAlertPage.errorBlock().should('contain.text', 'Enter why you are creating this alert')
          addAlertPage
            .errorBlock()
            .should('contain.text', 'Enter a real date in the format DD/MM/YYYY - for example, 27/03/2023')
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
          cy.signIn({ failOnStatusCode: false, redirectPath: '/prisoner/G6123VU/add-alert' })
          Page.verifyOnPage(NotFoundPage)
        })
      })
    })
  })
})
