import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { WhereaboutsApiClient } from '../data/interfaces/whereaboutsApi/whereaboutsApiClient'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import PrisonerLocationHistoryService from './prisonerLocationHistoryService'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { mockHistoryForLocation } from '../data/localMockData/getHistoryForLocationMock'
import StaffDetailsMock from '../data/localMockData/staffDetails'
import { GetDetailsMock } from '../data/localMockData/getDetailsMock'
import { agencyDetailsMock } from '../data/localMockData/agency'
import { getCellMoveReasonTypesMock } from '../data/localMockData/getCellMoveReasonTypesMock'
import { inmateDetailMock, inmateDetailMockOverride } from '../data/localMockData/inmateDetailMock'
import { CellMoveReasonMock } from '../data/localMockData/getCellMoveReasonMock'
import CaseNotesApiClient from '../data/interfaces/caseNotesApi/caseNotesApiClient'
import CellMoveReason from '../data/interfaces/whereaboutsApi/CellMoveReason'
import CaseNote from '../data/interfaces/caseNotesApi/CaseNote'
import { LocationsInsidePrisonApiClient } from '../data/interfaces/locationsInsidePrisonApi/LocationsInsidePrisonApiClient'
import { NomisSyncPrisonerMappingApiClient } from '../data/interfaces/nomisSyncPrisonerMappingApi/NomisSyncPrisonerMappingApiClient'
import { locationsInsidePrisonApiClientMock } from '../../tests/mocks/locationsInsidePrisonApiClientMock'
import { nomisSyncPrisonerMappingApiClientMock } from '../../tests/mocks/nomisSyncPrisonerMappingApiClientMock'
import { findCaseNotesMock } from '../data/localMockData/findCaseNotesMock'
import { caseNotesApiClientMock } from '../../tests/mocks/caseNotesApiClientMock'

describe('prisonerLocationHistoryService', () => {
  let prisonApiClient: PrisonApiClient
  let whereaboutsApiClient: WhereaboutsApiClient
  let caseNotesApiClient: CaseNotesApiClient
  let service: PrisonerLocationHistoryService
  const locationsInsidePrisonApiClient: LocationsInsidePrisonApiClient = locationsInsidePrisonApiClientMock()
  const nomisSyncPrisonerMappingApiClient: NomisSyncPrisonerMappingApiClient = nomisSyncPrisonerMappingApiClientMock()

  let locationAttributesForView = {}

  beforeEach(() => {
    prisonApiClient = prisonApiClientMock()
    caseNotesApiClient = caseNotesApiClientMock()
    whereaboutsApiClient = {
      getAppointment: jest.fn(),
      getCellMoveReason: jest.fn(),
      getUnacceptableAbsences: jest.fn(),
      createAppointments: jest.fn(),
    }

    prisonApiClient.getDetails = jest.fn().mockResolvedValue(GetDetailsMock)
    prisonApiClient.getStaffDetails = jest.fn().mockResolvedValue(StaffDetailsMock)
    prisonApiClient.getHistoryForLocation = jest
      .fn()
      .mockResolvedValue(mockHistoryForLocation([{ bookingId: PrisonerMockDataA.bookingId }]))
    prisonApiClient.getAgencyDetails = jest.fn().mockResolvedValue(agencyDetailsMock)
    prisonApiClient.getUserCaseLoads = jest.fn().mockResolvedValue(CaseLoadsDummyDataA)
    prisonApiClient.getCellMoveReasonTypes = jest.fn().mockResolvedValue(getCellMoveReasonTypesMock)
    prisonApiClient.getInmateDetail = jest.fn().mockResolvedValue(inmateDetailMock)
    whereaboutsApiClient.getCellMoveReason = jest.fn().mockResolvedValue(CellMoveReasonMock)
    caseNotesApiClient.getCaseNote = jest.fn().mockResolvedValue(findCaseNotesMock.content[0])

    const prisonApiClientBuilder = () => prisonApiClient
    const caseNotesApiClientBuilder = () => caseNotesApiClient
    const whereaboutsApiClientBuilder = () => whereaboutsApiClient
    const locationsInsidePrisonApiClientBuilder = () => locationsInsidePrisonApiClient
    const nomisSyncPrisonerMappingApiClientBuilder = () => nomisSyncPrisonerMappingApiClient

    nomisSyncPrisonerMappingApiClient.getMappingUsingNomisLocationId = jest
      .fn()
      .mockResolvedValue({ dpsLocationId: 'abcdefg' })

    locationsInsidePrisonApiClient.getLocation = jest
      .fn()
      .mockResolvedValue({ localName: 'Location 1', key: 'LEI-1-1' })

    locationsInsidePrisonApiClient.getLocationAttributes = jest.fn().mockResolvedValue([
      { code: 'CAT_A', description: 'Cat A Cell' },
      { code: 'SO', description: 'Single occupancy' },
    ])

    locationAttributesForView = {
      attributes: [
        {
          code: 'CAT_A',
          description: 'Cat A Cell',
        },
        { code: 'SO', description: 'Single occupancy' },
      ],
      description: 'LEI-1-1',
    }

    service = new PrisonerLocationHistoryService(
      prisonApiClientBuilder,
      whereaboutsApiClientBuilder,
      caseNotesApiClientBuilder,
      locationsInsidePrisonApiClientBuilder,
      nomisSyncPrisonerMappingApiClientBuilder,
    )
  })

  it('Returns the agency details from the API', async () => {
    const res = await service.getPrisonerLocationHistory(
      'token',
      PrisonerMockDataA,
      'LEI',
      '123456',
      '2023-01-01',
      '2024-01-01',
    )

    expect(nomisSyncPrisonerMappingApiClient.getMappingUsingNomisLocationId).toHaveBeenCalledWith(123456)
    expect(locationsInsidePrisonApiClient.getLocation).toHaveBeenCalledWith('abcdefg')
    expect(prisonApiClient.getAgencyDetails).toHaveBeenCalledWith('LEI')
    expect(res.agencyDetails).toEqual(agencyDetailsMock)
  })

  it('Returns the cell move reason types', async () => {
    const { cellMoveReasonTypes } = await service.getPrisonerLocationHistory(
      'token',
      PrisonerMockDataA,
      'LEI',
      '123456',
      '2023-01-01',
      '2024-01-01',
    )

    expect(cellMoveReasonTypes).toEqual(getCellMoveReasonTypesMock)
  })

  it('Returns the details of the current prisoner', async () => {
    prisonApiClient.getHistoryForLocation = jest.fn(async () =>
      mockHistoryForLocation([
        { bookingId: PrisonerMockDataA.bookingId, livingUnitId: 1234321 },
        { bookingId: 1 },
        { bookingId: 2 },
        { bookingId: 3 },
      ]),
    )

    const { currentPrisonerDetails } = await service.getPrisonerLocationHistory(
      'token',
      PrisonerMockDataA,
      'LEI',
      'locationId',
      '2023-01-01',
      '2024-01-01',
    )

    expect(currentPrisonerDetails.livingUnitId).toEqual(1234321)
  })

  it('Returns the location attributes from the API', async () => {
    locationsInsidePrisonApiClient.getLocation = jest.fn().mockResolvedValue({
      localName: 'Cell 1',
      key: 'LEI-1-1',
      specialistCellTypes: ['LISTENER_CRISIS'],
    })

    const res = await service.getPrisonerLocationHistory(
      'token',
      PrisonerMockDataA,
      'LEI',
      '123456',
      '2023-01-01',
      '2024-01-01',
    )

    expect(nomisSyncPrisonerMappingApiClient.getMappingUsingNomisLocationId).toHaveBeenCalledWith(123456)
    expect(locationsInsidePrisonApiClient.getLocation).toHaveBeenCalledWith('abcdefg')
    expect(res.locationAttributes).toEqual(locationAttributesForView)
  })

  it('Should only include known specialist cell types', async () => {
    locationsInsidePrisonApiClient.getLocation = jest.fn().mockResolvedValue({
      localName: 'Cell 1',
      key: 'LEI-1-1',
      specialistCellTypes: ['LISTENER_CRISIS', 'UNKNOWN_TYPE'],
    })

    const res = await service.getPrisonerLocationHistory(
      'token',
      PrisonerMockDataA,
      'LEI',
      '123456',
      '2023-01-01',
      '2024-01-01',
    )

    expect(nomisSyncPrisonerMappingApiClient.getMappingUsingNomisLocationId).toHaveBeenCalledWith(123456)
    expect(locationsInsidePrisonApiClient.getLocation).toHaveBeenCalledWith('abcdefg')
    expect(res.locationAttributes).toEqual(locationAttributesForView)
  })

  it('Gets the location history and populates it with details of the prisoner', async () => {
    prisonApiClient.getHistoryForLocation = jest.fn(async () =>
      mockHistoryForLocation([
        { bookingId: PrisonerMockDataA.bookingId },
        { bookingId: 1 },
        { bookingId: 2 },
        { bookingId: 3 },
      ]),
    )
    prisonApiClient.getInmateDetail = jest.fn(async (bookingId: number) => {
      switch (bookingId) {
        case 1:
          return inmateDetailMockOverride({ bookingId: 1, firstName: 'BookingId1' })
        case 2:
          return inmateDetailMockOverride({ bookingId: 2, firstName: 'BookingId2' })
        case 3:
          return inmateDetailMockOverride({ bookingId: 3, firstName: 'BookingId3' })
        default:
          return inmateDetailMock
      }
    })

    const res = await service.getPrisonerLocationHistory(
      'token',
      PrisonerMockDataA,
      'LEI',
      'locationId',
      '2023-01-01',
      '2024-01-01',
    )

    expect(prisonApiClient.getInmateDetail).toHaveBeenCalledWith(1)
    expect(prisonApiClient.getInmateDetail).toHaveBeenCalledWith(2)
    expect(prisonApiClient.getInmateDetail).toHaveBeenCalledWith(3)
    expect(res.locationHistoryWithPrisoner).toEqual(
      expect.arrayContaining([expect.objectContaining({ firstName: 'BookingId1' })]),
    )
    expect(res.locationHistoryWithPrisoner).toEqual(
      expect.arrayContaining([expect.objectContaining({ firstName: 'BookingId2' })]),
    )
    expect(res.locationHistoryWithPrisoner).toEqual(
      expect.arrayContaining([expect.objectContaining({ firstName: 'BookingId3' })]),
    )
  })

  it('Returns the staff name of the staff member who made the movement', async () => {
    const res = await service.getPrisonerLocationHistory(
      'token',
      PrisonerMockDataA,
      'LEI',
      'locationId',
      '2023-01-01',
      '2024-01-01',
    )

    expect(prisonApiClient.getAgencyDetails).toHaveBeenCalledWith('LEI')
    expect(res.agencyDetails).toEqual(agencyDetailsMock)
  })

  describe('whatHappened', () => {
    beforeEach(() => {
      prisonApiClient.getHistoryForLocation = jest.fn(async () =>
        mockHistoryForLocation([{ bookingId: PrisonerMockDataA.bookingId, bedAssignmentHistorySequence: 10 }]),
      )
    })

    describe('Given no cell move reason', () => {
      it('Returns null', async () => {
        whereaboutsApiClient.getCellMoveReason = jest.fn(async (): Promise<CellMoveReason> => null)
        const res = await service.getPrisonerLocationHistory(
          'token',
          PrisonerMockDataA,
          'LEI',
          'locationId',
          '2023-01-01',
          '2024-01-01',
        )

        expect(res.whatHappenedDetails).toEqual(null)
      })
    })

    describe('Given a cell move reason', () => {
      describe('and no relevant case note', () => {
        it('Returns null', async () => {
          caseNotesApiClient.getCaseNote = jest.fn(async (): Promise<CaseNote> => null)
          const res = await service.getPrisonerLocationHistory(
            'token',
            PrisonerMockDataA,
            'LEI',
            'locationId',
            '2023-01-01',
            '2024-01-01',
          )

          expect(res.whatHappenedDetails).toEqual(null)
        })
      })

      describe('and a relevant case note', () => {
        it('Returns the text of the case note', async () => {
          const res = await service.getPrisonerLocationHistory(
            'token',
            PrisonerMockDataA,
            'LEI',
            'locationId',
            '2023-01-01',
            '2024-01-01',
          )

          expect(whereaboutsApiClient.getCellMoveReason).toHaveBeenCalledWith(PrisonerMockDataA.bookingId, 10, true)
          expect(caseNotesApiClient.getCaseNote).toHaveBeenCalledWith(
            PrisonerMockDataA.prisonerNumber,
            PrisonerMockDataA.prisonId,
            CellMoveReasonMock.cellMoveReason.caseNoteId.toString(),
            true,
          )
          expect(res.whatHappenedDetails).toEqual(findCaseNotesMock.content[0].text)
        })
      })
    })
  })
})
