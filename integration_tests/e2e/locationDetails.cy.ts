import LocationDetailsPage from '../pages/locationDetailsPage'
import Page from '../pages/page'
import { PrisonerMockDataA, PrisonerMockDataB } from '../../server/data/localMockData/prisoner'
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
    cy.task('stubGetAgency', { agencyId: 'MDI' })
    cy.task('stubGetAgency', { agencyId: 'LEI', override: { description: 'Leeds (HMP)' } })
    cy.task('stubStaffDetails', 'DEMO_USER1')
    cy.task('stubReceptionsWithCapacity', 'MDI')
    cy.task('stubCellHistory', { bookingId })
    cy.task('stubInmatesAtLocation', {
      locationId,
      overrides: [
        { firstName: 'Joe', lastName: 'Bloggs', offenderNo: 'B2222BB' },
        { firstName: 'Bob', lastName: 'Doe', offenderNo: 'C3333CC' },
      ],
    })
    cy.task('stubDpsConsiderRisksReceptionPage', prisonerNumber)
  })

  it('should display the "Move to reception" link', () => {
    cy.setupUserAuth({ roles: ['ROLE_PRISON', 'ROLE_CELL_MOVE'] })
    locationDetailsPage = visitLocationDetailsPage(prisonerNumber)
    locationDetailsPage.moveToReceptionBtn().click()
  })

  it('should display the "Change cell" link', () => {
    cy.setupUserAuth({ roles: ['ROLE_PRISON', 'ROLE_CELL_MOVE'] })
    locationDetailsPage = visitLocationDetailsPage(prisonerNumber)
    locationDetailsPage.changeCellBtn().click()
  })

  it('should not display the "Move to reception" link when user does not have the CELL_MOVE role', () => {
    cy.setupUserAuth({ roles: ['ROLE_PRISON'] })
    locationDetailsPage = visitLocationDetailsPage(prisonerNumber)
    locationDetailsPage.moveToReceptionBtn().should('not.exist')
  })

  it('should provide links to profiles of prisoners that the prisoner is sharing a location with', () => {
    cy.setupUserAuth({ roles: ['ROLE_PRISON', 'ROLE_CELL_MOVE'] })
    locationDetailsPage = visitLocationDetailsPage(prisonerNumber)

    locationDetailsPage.currentInmate(1).contains('Joe Bloggs')
    locationDetailsPage.currentInmate(1).children().should('have.attr', 'href').and('eq', '/prisoner/B2222BB')

    locationDetailsPage.currentInmate(2).contains('Bob Doe')
    locationDetailsPage.currentInmate(2).children().should('have.attr', 'href').and('eq', '/prisoner/C3333CC')
  })

  it('should provide a link to the current location history', () => {
    cy.setupUserAuth({ roles: ['ROLE_PRISON', 'ROLE_CELL_MOVE'] })
    locationDetailsPage = visitLocationDetailsPage(prisonerNumber)

    locationDetailsPage.locationHistoryLink().contains('View details')
    locationDetailsPage
      .locationHistoryLink()
      .should('have.attr', 'href')
      .and('contain', `/prisoner/${prisonerNumber}/location-history`)
      .and(
        'match',
        new RegExp(
          `.*/prisoner/${prisonerNumber}/location-history?.*locationId=${mockCellHistoryItem1.livingUnitId}.*agencyId=MDI`,
        ),
      )
  })
})
