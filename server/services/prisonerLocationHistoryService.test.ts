import type { SanitisedError } from '@ministryofjustice/hmpps-rest-client'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
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
import { CellMovementReasonMock } from '../data/localMockData/cellMovementReasonMock'
import { CellMovementReason, CellMovementsApiClient } from '../data/interfaces/cellMovementsApi'
import { LocationsInsidePrisonApiClient } from '../data/interfaces/locationsInsidePrisonApi/LocationsInsidePrisonApiClient'
import { NomisSyncPrisonerMappingApiClient } from '../data/interfaces/nomisSyncPrisonerMappingApi/NomisSyncPrisonerMappingApiClient'
import { locationsInsidePrisonApiClientMock } from '../../tests/mocks/locationsInsidePrisonApiClientMock'
import { nomisSyncPrisonerMappingApiClientMock } from '../../tests/mocks/nomisSyncPrisonerMappingApiClientMock'

describe('prisonerLocationHistoryService', () => {
  let prisonApiClient: PrisonApiClient
  let cellMovementsApiClient: CellMovementsApiClient
  let service: PrisonerLocationHistoryService
  const locationsInsidePrisonApiClient: LocationsInsidePrisonApiClient = locationsInsidePrisonApiClientMock()
  const nomisSyncPrisonerMappingApiClient: NomisSyncPrisonerMappingApiClient = nomisSyncPrisonerMappingApiClientMock()

  let locationAttributesForView = {}

  beforeEach(() => {
    prisonApiClient = prisonApiClientMock()
    cellMovementsApiClient = {
      getCellMovementReason: jest.fn(),
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
    cellMovementsApiClient.getCellMovementReason = jest.fn().mockResolvedValue(CellMovementReasonMock)

    const prisonApiClientBuilder = () => prisonApiClient
    const cellMovementsApiClientBuilder = () => cellMovementsApiClient
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
      cellMovementsApiClientBuilder,
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
    expect(locationsInsidePrisonApiClient.getLocationAttributes).toHaveBeenCalledWith('abcdefg')
    expect(res.locationAttributes).toEqual(locationAttributesForView)
  })

  it('Returns empty location attributes when looking up non-cell location in API ', async () => {
    locationsInsidePrisonApiClient.getLocation = jest.fn().mockResolvedValue({
      localName: 'Reception',
      key: 'MDI-RECV',
      specialistCellTypes: [],
    })
    locationsInsidePrisonApiClient.getLocationAttributes = jest
      .fn()
      .mockRejectedValue({ responseStatus: 404 } as SanitisedError)

    const res = await service.getPrisonerLocationHistory(
      'token',
      PrisonerMockDataA,
      'MDI',
      '123457',
      '2023-01-01',
      '2024-01-01',
    )

    expect(nomisSyncPrisonerMappingApiClient.getMappingUsingNomisLocationId).toHaveBeenCalledWith(123457)
    expect(locationsInsidePrisonApiClient.getLocation).toHaveBeenCalledWith('abcdefg')
    expect(locationsInsidePrisonApiClient.getLocationAttributes).toHaveBeenCalledWith('abcdefg')
    expect(res.locationAttributes).toEqual({ description: 'MDI-RECV', attributes: [] })
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

    describe('Given no cell movement recorded for the bed assignment', () => {
      it('Returns null', async () => {
        cellMovementsApiClient.getCellMovementReason = jest.fn(async (): Promise<CellMovementReason> => null)
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

    describe('Given a cell movement without an explanation', () => {
      it('Returns null', async () => {
        // A migrated movement whose case note is gone: the movement exists but commentText is null.
        cellMovementsApiClient.getCellMovementReason = jest
          .fn()
          .mockResolvedValue({ ...CellMovementReasonMock, commentText: null })
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

    describe('Given a cell movement with an explanation', () => {
      it('Returns the explanation, in one call with no case-notes hop', async () => {
        const res = await service.getPrisonerLocationHistory(
          'token',
          PrisonerMockDataA,
          'LEI',
          'locationId',
          '2023-01-01',
          '2024-01-01',
        )

        expect(cellMovementsApiClient.getCellMovementReason).toHaveBeenCalledWith(PrisonerMockDataA.bookingId, 10, true)
        expect(res.whatHappenedDetails).toEqual(CellMovementReasonMock.commentText)
      })
    })
  })
})
