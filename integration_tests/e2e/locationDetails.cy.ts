import LocationDetailsPage from '../pages/locationDetailsPage'
import Page from '../pages/page'
import { PrisonerMockDataA } from '../../server/data/localMockData/prisoner'
import {
  mockCellHistoryItem1,
  mockCellHistoryItem2,
  mockCellHistoryItem4,
} from '../../server/data/localMockData/offenderCellHistoryMock'

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
    cy.setupComponentsData()
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

    locationDetailsPage.currentLocationHistoryLink().contains('View details')
    locationDetailsPage
      .currentLocationHistoryLink()
      .should('have.attr', 'href')
      .and(
        'match',
        new RegExp(
          `^/prisoner/${prisonerNumber}/location-history?.*agencyId=MDI&locationId=${mockCellHistoryItem1.livingUnitId}.*`,
        ),
      )
  })

  it('should provide a details of previous locations', () => {
    cy.setupUserAuth({ roles: ['ROLE_PRISON', 'ROLE_CELL_MOVE'] })
    locationDetailsPage = visitLocationDetailsPage(prisonerNumber)

    // Moorland
    locationDetailsPage.previousLocationAgency(1).contains('Moorland (HMP & YOI) from 01/12/2023 to 01/01/2024')
    locationDetailsPage.previousLocation(1, 1, it => {
      expect(it.location).to.contain('1-1-2')
      expect(it.movedIn).to.contain('01/12/2023 - 10:20')
      expect(it.movedInBy).to.contain('John Smith')
      expect(it.movedOut).to.contain('01/01/2024 - 01:02')
      expect(it.linkVisible).to.eq(true)
      expect(it.link).to.match(
        new RegExp(
          `^/prisoner/${prisonerNumber}/location-history?.*agencyId=MDI&locationId=${mockCellHistoryItem2.livingUnitId}.*`,
        ),
      )
    })

    locationDetailsPage.previousLocation(1, 2, it => {
      expect(it.location).to.contain('Reception')
      expect(it.movedIn).to.contain('01/12/2023 - 01:02')
      expect(it.movedInBy).to.contain('John Smith')
      expect(it.movedOut).to.contain('01/12/2023 - 10:20')
      expect(it.linkVisible).to.eq(false)
    })

    // Leeds
    locationDetailsPage.previousLocationAgency(2).contains('Leeds (HMP) from 01/11/2023 to 01/12/2023')
    locationDetailsPage.previousLocation(2, 1, it => {
      expect(it.location).to.contain('1-1-4')
      expect(it.movedIn).to.contain('01/11/2023 - 01:02')
      expect(it.movedInBy).to.contain('John Smith')
      expect(it.movedOut).to.contain('01/12/2023 - 01:02')
      expect(it.linkVisible).to.eq(true)
      expect(it.link).to.match(
        new RegExp(
          `^/prisoner/${prisonerNumber}/location-history?.*agencyId=LEI&locationId=${mockCellHistoryItem4.livingUnitId}.*`,
        ),
      )
    })
  })
})
