import { CaseNotesApiClient } from '../data/interfaces/caseNotesApiClient'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { WhereaboutsApiClient } from '../data/interfaces/whereaboutsApiClient'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import prisonerLocationHistoryService, { PrisonerLocationHistoryService } from './prisonerLocationHistoryService'
import { PrisonerMockDataA, PrisonerMockDataB } from '../data/localMockData/prisoner'
import { GetAttributesForLocation } from '../data/localMockData/getAttributesForLocationMock'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { mockHistoryForLocation } from '../data/localMockData/getHistoryForLocationMock'
import StaffDetailsMock from '../data/localMockData/staffDetails'
import { GetDetailsMock } from '../data/localMockData/getDetailsMock'
import { agencyDetailsMock } from '../data/localMockData/agency'
import { getCellMoveReasonTypesMock } from '../data/localMockData/getCellMoveReasonTypesMock'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import { CellMoveReasonMock } from '../data/localMockData/getCellMoveReasonMock'
import { pagedCaseNotesMock } from '../data/localMockData/pagedCaseNotesMock'
import NotFoundApiError from '../../tests/errors/notFoundApiError'

describe('prisonerLocationHistoryService', () => {
  let prisonApiClient: PrisonApiClient
  let whereaboutsApiClient: WhereaboutsApiClient
  let caseNotesApiClient: CaseNotesApiClient
  let service: PrisonerLocationHistoryService

  beforeEach(() => {
    prisonApiClient = prisonApiClientMock()
    whereaboutsApiClient = {
      getCellMoveReason: jest.fn(),
      getUnacceptableAbsences: jest.fn(),
      addVideoLinkBooking: jest.fn(),
      createAppointments: jest.fn(),
      getCourts: jest.fn(),
    }

    caseNotesApiClient = {
      getCaseNoteTypes: jest.fn(),
      getCaseNoteTypesForUser: jest.fn(),
      getCaseNotes: jest.fn(),
      addCaseNote: jest.fn(),
      getCaseNote: jest.fn(),
    }

    prisonApiClient.getDetails = jest.fn().mockResolvedValue(GetDetailsMock)
    prisonApiClient.getStaffDetails = jest.fn().mockResolvedValue(StaffDetailsMock)
    prisonApiClient.getAttributesForLocation = jest.fn().mockResolvedValue(GetAttributesForLocation)
    prisonApiClient.getHistoryForLocation = jest
      .fn()
      .mockResolvedValue(mockHistoryForLocation([{ bookingId: PrisonerMockDataA.bookingId }]))
    prisonApiClient.getAgencyDetails = jest.fn().mockResolvedValue(agencyDetailsMock)
    prisonApiClient.getUserCaseLoads = jest.fn().mockResolvedValue(CaseLoadsDummyDataA)
    prisonApiClient.getCellMoveReasonTypes = jest.fn().mockResolvedValue(getCellMoveReasonTypesMock)
    prisonApiClient.getInmateDetail = jest.fn().mockResolvedValue(inmateDetailMock)
    whereaboutsApiClient.getCellMoveReason = jest.fn().mockResolvedValue(CellMoveReasonMock)
    caseNotesApiClient.getCaseNote = jest.fn().mockResolvedValue(pagedCaseNotesMock.content[0])

    const prisonApiClientBuilder = () => prisonApiClient
    const caseNotesApiClientBuilder = () => caseNotesApiClient
    const whereaboutsApiClientBuilder = () => whereaboutsApiClient

    service = prisonerLocationHistoryService({
      prisonApiClientBuilder,
      whereaboutsApiClientBuilder,
      caseNotesApiClientBuilder,
    })
  })

  it('Populates the page data with information about the prisoner', async () => {
    const pageData = await service(
      'token',
      PrisonerMockDataA,
      'LEI',
      'locationId',
      '2022-01-01',
      '2023-01-01',
      CaseLoadsDummyDataA,
    )
    expect(pageData.prisonerName).toEqual('John Saunders')
    expect(pageData.prisonerNumber).toEqual(PrisonerMockDataA.prisonerNumber)
  })

  it('Populates the location name with the description from the API', async () => {
    const pageData = await service(
      'token',
      PrisonerMockDataA,
      'LEI',
      'locationId',
      '2022-01-01',
      '2023-01-01',
      CaseLoadsDummyDataA,
    )
    expect(pageData.locationName).toEqual('1-1')
  })

  describe('Location details', () => {
    it('Populates the location details with information from the API', async () => {
      const { locationDetails } = await service(
        'token',
        PrisonerMockDataA,
        'LEI',
        'locationId',
        '2022-01-01',
        '2023-01-01',
        CaseLoadsDummyDataA,
      )

      expect(locationDetails.description).toEqual('Leeds (HMP)')
      expect(locationDetails.movedIn).toEqual('05/07/2021 - 10:35')
      expect(locationDetails.movedOut).toEqual('05/07/2021 - 10:35')
      expect(locationDetails.movedBy).toEqual('John Smith')
      expect(locationDetails.reasonForMove).toEqual('Some description')
      expect(locationDetails.whatHappened).toEqual('Test tes')
      expect(locationDetails.attributes).toEqual(GetAttributesForLocation.attributes)
    })
  })

  describe('Location sharing history', () => {
    it('Returns the location sharing history from the API', async () => {
      const prisonerBInmateDetail = {
        ...inmateDetailMock,
        bookingId: PrisonerMockDataB.bookingId,
        firstName: 'Second',
        lastName: 'Person',
        offenderNo: 'A1234BC',
      }
      prisonApiClient.getHistoryForLocation = jest.fn(async () =>
        mockHistoryForLocation([
          { bookingId: PrisonerMockDataA.bookingId },
          { bookingId: PrisonerMockDataB.bookingId },
        ]),
      )
      prisonApiClient.getInmateDetail = jest.fn(async bookingId => {
        if (bookingId === PrisonerMockDataA.bookingId) return inmateDetailMock
        return prisonerBInmateDetail
      })

      const { locationSharingHistory } = await service(
        'token',
        PrisonerMockDataA,
        'LEI',
        'locationId',
        '2022-01-01',
        '2023-01-01',
        CaseLoadsDummyDataA,
      )

      expect(locationSharingHistory.length).toEqual(1)
      const history = locationSharingHistory[0]
      expect(history.movedIn).toEqual('05/07/2021 - 10:35')
      expect(history.movedOut).toEqual('05/07/2021 - 10:35')
      expect(history.name).toEqual('Person, Second')
      expect(history.number).toEqual('A1234BC')
      expect(history.shouldLink).toEqual(true)
    })
  })

  describe('Given no cell move reason', () => {
    it('Puts placeholder text in for the what happened', async () => {
      whereaboutsApiClient.getCellMoveReason = jest.fn(async () => null)

      const pageData = await service(
        'token',
        PrisonerMockDataA,
        'LEI',
        'locationId',
        '2022-01-01',
        '2023-01-01',
        CaseLoadsDummyDataA,
      )

      expect(pageData.locationDetails.whatHappened).toEqual('Not entered')
    })
  })
})
