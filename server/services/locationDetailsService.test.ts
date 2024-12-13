import LocationDetailsService from './locationDetailsService'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { mockCellHistoryItem1, mockOffenderCellHistory } from '../data/localMockData/offenderCellHistoryMock'
import AgenciesMock from '../data/localMockData/agenciesDetails'
import StaffDetailsMock from '../data/localMockData/staffDetails'
import OffenderCellHistory, { OffenderCellHistoryItem } from '../data/interfaces/prisonApi/OffenderCellHistoryInterface'
import ReceptionsWithCapacityMock from '../data/localMockData/receptionsWithCapacityMock'
import { AgencyDetails } from '../data/interfaces/prisonApi/Agency'
import StaffDetails from '../data/interfaces/prisonApi/StaffDetails'
import { mockInmateAtLocation } from '../data/localMockData/locationsInmates'
import LocationDetails from './interfaces/locationDetailsService/LocationDetails'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import Reception from '../data/interfaces/prisonApi/Reception'
import { NomisSyncPrisonerMappingApiClient } from '../data/interfaces/nomisSyncPrisonerMappingApi/NomisSyncPrisonerMappingApiClient'
import { LocationsInsidePrisonApiClient } from '../data/interfaces/locationsInsidePrisonApi/LocationsInsidePrisonApiClient'
import { nomisSyncPrisonerMappingApiClientMock } from '../../tests/mocks/nomisSyncPrisonerMappingApiClientMock'
import { locationsInsidePrisonApiClientMock } from '../../tests/mocks/locationsInsidePrisonApiClientMock'

describe('prisonerLocationDetailsService', () => {
  let service: LocationDetailsService
  let prisonApiClient: PrisonApiClient
  let nomisSyncPrisonerMappingApiClient: NomisSyncPrisonerMappingApiClient
  let locationsInsidePrisonApiClient: LocationsInsidePrisonApiClient

  beforeEach(() => {
    prisonApiClient = prisonApiClientMock()
    nomisSyncPrisonerMappingApiClient = nomisSyncPrisonerMappingApiClientMock()
    locationsInsidePrisonApiClient = locationsInsidePrisonApiClientMock()

    service = new LocationDetailsService(
      () => prisonApiClient,
      () => nomisSyncPrisonerMappingApiClient,
      () => locationsInsidePrisonApiClient,
    )

    prisonApiClient.getStaffDetails = jest.fn(async (username: string) => generateStaffDetails(username))
    prisonApiClient.getAgencyDetails = jest.fn(async (agencyId: string) => generateAgencyDetails(agencyId))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const mappingResponse = { nomisLocationId: 123, dpsLocationId: 'abc' }
  describe('getLocationMappingUsingNomisLocationId', () => {
    it('returns data mapping using Nomis locationId ', async () => {
      nomisSyncPrisonerMappingApiClient.getMappingUsingNomisLocationId = jest.fn(async () => mappingResponse)
      await expect(service.getLocationMappingUsingNomisLocationId('', 123)).resolves.toEqual(mappingResponse)
    })
  })

  describe('getLocation', () => {
    const response = { id: 'abc', key: 'ABC', localName: 'Local name' }
    it('returns data for single location', async () => {
      locationsInsidePrisonApiClient.getLocation = jest.fn(async () => response)
      await expect(service.getLocation('', 'abc')).resolves.toEqual(response)
    })
  })

  describe('getLocationByNomisLocationId', () => {
    const response = { id: 'abc', key: 'ABC', localName: 'Local name' }
    it('returns data for single location', async () => {
      nomisSyncPrisonerMappingApiClient.getMappingUsingNomisLocationId = jest.fn(async () => mappingResponse)
      locationsInsidePrisonApiClient.getLocation = jest.fn(async () => response)
      await expect(service.getLocationByNomisLocationId('', 123)).resolves.toEqual(response)
      expect(locationsInsidePrisonApiClient.getLocation).lastCalledWith('abc')
    })
  })

  describe('getInmatesAtLocation', () => {
    it('returns data about inmates sharing a location', async () => {
      prisonApiClient.getInmatesAtLocation = jest.fn(async () => [mockInmateAtLocation])
      await expect(service.getInmatesAtLocation('', 123)).resolves.toEqual([mockInmateAtLocation])
    })
  })

  describe('isReceptionFull', () => {
    it('returns true when no receptions with capacity', async () => {
      prisonApiClient.getReceptionsWithCapacity = jest.fn(async (): Promise<Reception[]> => [])
      await expect(service.isReceptionFull('', 'LEI')).resolves.toEqual(true)
    })

    it('returns false when there are receptions with capacity', async () => {
      prisonApiClient.getReceptionsWithCapacity = jest.fn(async () => ReceptionsWithCapacityMock)
      await expect(service.isReceptionFull('', 'LEI')).resolves.toEqual(false)
    })
  })

  describe('getLocationDetailsByLatestFirst', () => {
    it('handles empty list of cell history', async () => {
      prisonApiClient.getOffenderCellHistory = jest.fn(async (): Promise<OffenderCellHistory> => ({ content: [] }))
      await expect(service.getLocationDetailsByLatestFirst('', prisonerNumber, 123)).resolves.toEqual([])
    })

    it('returns location details in order of latest first', async () => {
      prisonApiClient.getOffenderCellHistory = jest.fn(async () =>
        mockOffenderCellHistory([
          generateCellHistory({ order: 1, agency: 1, livingUnitId: 1, movementMadeByUsername: 'USER_1' }),
          generateCellHistory({ order: 2, agency: 2, livingUnitId: 1, movementMadeByUsername: 'USER_2' }),
          generateCellHistory({ order: 3, agency: 3, livingUnitId: 1, movementMadeByUsername: 'USER_3' }),
        ]),
      )

      // The greater the 'order', the later the date, so we expect the higher 'order' values first:
      await expect(service.getLocationDetailsByLatestFirst('', prisonerNumber, 123)).resolves.toEqual([
        generateLocation({ order: 3, agency: 3, livingUnitId: 1, movementMadeByUsername: 'USER_3' }),
        generateLocation({ order: 2, agency: 2, livingUnitId: 1, movementMadeByUsername: 'USER_2' }),
        generateLocation({ order: 1, agency: 1, livingUnitId: 1, movementMadeByUsername: 'USER_1' }),
      ])
    })

    describe('returns formatted location description', () => {
      it.each([
        ['a normal location', 'MDI-1-1-1', '1-1-1'],
        ['a reception', 'MDI-RECP', 'Reception'],
        ['no cell allocated', 'MDI-CSWAP', 'No cell allocated'],
        ['a court', 'MDI-COURT', 'Court'],
      ])(
        'Given %s (%s) return formatted as "%s"',
        async (_: string, description: string, formattedLocationDescription: string) => {
          prisonApiClient.getOffenderCellHistory = jest.fn(async () => mockOffenderCellHistory([{ description }]))
          const locationDetails = await service.getLocationDetailsByLatestFirst('', prisonerNumber, 123)
          expect(locationDetails[0].location).toEqual(formattedLocationDescription)
        },
      )
    })

    describe('determines if the location description is "temporary"', () => {
      it.each([
        ['a normal location', 'MDI-1-1-1', false],
        ['a reception', 'MDI-RECP', true],
        ['no cell allocated', 'MDI-CSWAP', true],
        ['a court', 'MDI-COURT', true],
        ['TAP', 'MDI-TAP', true],
      ])(
        'Given %s (%s) return isTemporaryLocation "%s"',
        async (_: string, description: string, isTemporaryLocation: boolean) => {
          prisonApiClient.getOffenderCellHistory = jest.fn(async () => mockOffenderCellHistory([{ description }]))
          const locationDetails = await service.getLocationDetailsByLatestFirst('', prisonerNumber, 123)
          expect(locationDetails[0].isTemporaryLocation).toEqual(isTemporaryLocation)
        },
      )
    })
  })

  describe('getLocationDetailsGroupedByPeriodAtAgency', () => {
    it('handles empty list', () => {
      expect(service.getLocationDetailsGroupedByPeriodAtAgency([])).toEqual([])
    })

    it('handles list of one', () => {
      const location = generateLocation({ agency: 1, livingUnitId: 1, order: 1 })
      expect(service.getLocationDetailsGroupedByPeriodAtAgency([location])).toEqual([
        {
          agencyName: 'Agency 1',
          fromDate: '2024-01-01T01:02:03',
          toDate: '2024-01-02T01:02:03',
          locationDetails: [location],
        },
      ])
    })

    it('handles list of locations all in the same agency', () => {
      const location1 = generateLocation({ agency: 1, livingUnitId: 1, order: 1 })
      const location2 = generateLocation({ agency: 1, livingUnitId: 2, order: 2 })
      const location3 = generateLocation({ agency: 1, livingUnitId: 3, order: 3 })

      expect(service.getLocationDetailsGroupedByPeriodAtAgency([location3, location2, location1])).toEqual([
        {
          agencyName: 'Agency 1',
          fromDate: '2024-01-01T01:02:03',
          toDate: '2024-01-04T01:02:03',
          locationDetails: [location3, location2, location1],
        },
      ])
    })

    it('handles list of locations all in multiple agencies', () => {
      const location1 = generateLocation({ agency: 1, livingUnitId: 1, order: 1 })
      const location2 = generateLocation({ agency: 1, livingUnitId: 2, order: 2 })
      const location3 = generateLocation({ agency: 2, livingUnitId: 1, order: 3 })
      const location4 = generateLocation({ agency: 3, livingUnitId: 1, order: 4 })
      const location5 = generateLocation({ agency: 3, livingUnitId: 2, order: 5 })
      const location6 = generateLocation({ agency: 3, livingUnitId: 3, order: 6 })

      expect(
        service.getLocationDetailsGroupedByPeriodAtAgency([
          location6,
          location5,
          location4,
          location3,
          location2,
          location1,
        ]),
      ).toEqual([
        {
          agencyName: 'Agency 3',
          fromDate: '2024-01-04T01:02:03',
          toDate: '2024-01-07T01:02:03',
          locationDetails: [location6, location5, location4],
        },
        {
          agencyName: 'Agency 2',
          fromDate: '2024-01-03T01:02:03',
          toDate: '2024-01-04T01:02:03',
          locationDetails: [location3],
        },
        {
          agencyName: 'Agency 1',
          fromDate: '2024-01-01T01:02:03',
          toDate: '2024-01-03T01:02:03',
          locationDetails: [location2, location1],
        },
      ])
    })

    it('handles returning back to a previous agency', () => {
      const location1 = generateLocation({ agency: 1, livingUnitId: 1, order: 1 })
      const location2 = generateLocation({ agency: 2, livingUnitId: 1, order: 2 })
      const location3 = generateLocation({ agency: 1, livingUnitId: 1, order: 3 })

      expect(service.getLocationDetailsGroupedByPeriodAtAgency([location3, location2, location1])).toEqual([
        {
          agencyName: 'Agency 1',
          fromDate: '2024-01-03T01:02:03',
          toDate: '2024-01-04T01:02:03',
          locationDetails: [location3],
        },
        {
          agencyName: 'Agency 2',
          fromDate: '2024-01-02T01:02:03',
          toDate: '2024-01-03T01:02:03',
          locationDetails: [location2],
        },
        {
          agencyName: 'Agency 1',
          fromDate: '2024-01-01T01:02:03',
          toDate: '2024-01-02T01:02:03',
          locationDetails: [location1],
        },
      ])
    })

    it('marks agencies without a name invalid', () => {
      const location: LocationDetails = {
        ...generateLocation({ agency: 1, livingUnitId: 1, order: 1 }),
        agencyName: null,
      }
      expect(service.getLocationDetailsGroupedByPeriodAtAgency([location])).toEqual([
        {
          agencyName: null,
          fromDate: '2024-01-01T01:02:03',
          toDate: '2024-01-02T01:02:03',
          locationDetails: [location],
        },
      ])
    })
  })
})

const { prisonerNumber } = PrisonerMockDataA

const generateAgencyDetails = (agencyId: string): AgencyDetails => ({
  ...AgenciesMock,
  agencyId,
  description: agencyId.replace('AGY', 'Agency '),
})

const generateStaffDetails = (username: string): StaffDetails => ({
  ...StaffDetailsMock,
  username,
  firstName: username.split('_')[0],
  lastName: username.split('_')[1],
})

const generateCellHistory = ({
  agency,
  livingUnitId,
  order,
  movementMadeByUsername = 'JOHN_SMITH',
}: {
  agency: number
  livingUnitId: number
  order: number
  movementMadeByUsername?: string
}): OffenderCellHistoryItem => ({
  ...mockCellHistoryItem1,
  agencyId: `AGY${agency}`,
  livingUnitId,
  description: `AGY${agency}-1-1-${livingUnitId}`,
  assignmentDateTime: generateTestDateTime(order),
  assignmentEndDateTime: generateTestDateTime(order + 1),
  movementMadeBy: movementMadeByUsername,
})

const generateLocation = ({
  agency,
  livingUnitId,
  order,
  movementMadeByUsername = 'JOHN_SMITH',
}: {
  agency: number
  livingUnitId: number
  order: number
  movementMadeByUsername?: string
}): LocationDetails => ({
  prisonerNumber,
  agencyId: `AGY${agency}`,
  agencyName: `Agency ${agency}`,
  livingUnitId,
  location: `1-1-${livingUnitId}`,
  isTemporaryLocation: false,
  assignmentDateTime: generateTestDateTime(order),
  assignmentEndDateTime: generateTestDateTime(order + 1),
  movementMadeByUsername,
  movementMadeByStaffDetails: generateStaffDetails(movementMadeByUsername),
})

const generateTestDateTime = (dayOfMonth: number) => `2024-01-${dayOfMonth.toString().padStart(2, '0')}T01:02:03`
