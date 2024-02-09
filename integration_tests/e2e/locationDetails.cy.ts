import LocationDetailsPage from '../pages/locationDetailsPage'
import Page from '../pages/page'
import { PrisonerMockDataA } from '../../server/data/localMockData/prisoner'
import { mockCellHistoryItem1 } from '../../server/data/localMockData/offenderCellHistoryMock'

const visitLocationDetailsPage = (prisonerNumber: string): LocationDetailsPage => {
  cy.signIn({
    redirectPath: `/prisoner/${prisonerNumber}/location-details`,
  })
  return Page.verifyOnPageWithTitle(LocationDetailsPage, 'John Saunders’ location details')
}

context('Location details page', () => {
  const { prisonerNumber, bookingId } = PrisonerMockDataA
  const locationId = mockCellHistoryItem1.livingUnitId

  let locationDetailsPage: LocationDetailsPage

  beforeEach(() => {
    cy.task('reset')

    cy.task('stubPrisonerData', { prisonerNumber })
    cy.task('stubInmateDetail', { bookingId })
    cy.task('stubAssessments', bookingId)
    cy.task('stubGetAgency', 'MDI')
    cy.task('stubStaffDetails', 'DEMO_USER1')
    cy.task('stubReceptionsWithCapacity', 'MDI')
    cy.task('stubCellHistory', bookingId)
    cy.task('stubInmatesAtLocation', locationId)
    cy.task('stubDpsConsiderRisksReceptionPage', prisonerNumber)
  })

  it('should display the "Move to reception" link', () => {
    cy.setupUserAuth({ roles: ['ROLE_PRISON', 'ROLE_CELL_MOVE'] })
    locationDetailsPage = visitLocationDetailsPage(prisonerNumber)
    locationDetailsPage.moveToReceptionBtn().click()
  })

  it('should not display the "Move to reception" link when user does not have the CELL_MOVE role', () => {
    cy.setupUserAuth({ roles: ['ROLE_PRISON'] })
    locationDetailsPage = visitLocationDetailsPage(prisonerNumber)
    locationDetailsPage.moveToReceptionBtn().should('not.exist')
  })
})
