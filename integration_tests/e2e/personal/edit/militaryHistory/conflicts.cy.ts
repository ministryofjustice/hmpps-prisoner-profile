import Page from '../../../../pages/page'
import {
  MilitaryRecordsMock,
  MilitaryWarZoneRefDataMock,
} from '../../../../../server/data/localMockData/personIntegrationApiReferenceDataMock'
import ConflictsPage from '../../../../pages/conflictsPage'

const visitConflictsPage = (): ConflictsPage => {
  cy.signIn({ redirectPath: '/prisoner/G6123VU/personal/conflicts/1' })
  return Page.verifyOnPageWithTitle(ConflictsPage, `What was the most recent conflict John Saunders served in?`)
}

describe('Military Records - Conflicts Page', () => {
  let conflictsPage: ConflictsPage

  beforeEach(() => {
    cy.task('reset')
    cy.setupUserAuth()
    cy.setupComponentsData()
    cy.setupBannerStubs({ prisonerNumber: 'G6123VU' })
    cy.task('stubInmateDetail', { bookingId: 1102484 })
    cy.task('stubPrisonerDetail', 'G6123VU')
    cy.task('stubPersonIntegrationGetReferenceData', {
      domain: 'MLTY_WZONE',
      referenceData: MilitaryWarZoneRefDataMock,
    })
    cy.task('stubPersonIntegrationGetMilitaryRecords', MilitaryRecordsMock)
    cy.task('stubPersonIntegrationUpdateMilitaryRecord')
    cy.task('stubPersonIntegrationCreateMilitaryRecord')

    conflictsPage = visitConflictsPage()
  })

  it('should display the mini banner with prisoner details', () => {
    conflictsPage.miniBanner().card().should('exist')
    conflictsPage.miniBanner().name().should('contain.text', 'Saunders, John')
  })

  it('should display the war zone options', () => {
    conflictsPage.warZoneRadioOptions().should('exist')
  })

  it('should submit the form and redirect to personal page on "Save and return to profile"', () => {
    conflictsPage.warZoneRadio().click()
    conflictsPage.saveAndReturnButton().click()
    cy.url().should('include', `/prisoner/G6123VU/personal#military-service-information`)
  })

  it('should navigate back to personal page on cancel', () => {
    cy.get('a[data-qa="cancel-button"]').click()
    cy.url().should('include', `/prisoner/G6123VU/personal#military-service-information`)
  })
})
