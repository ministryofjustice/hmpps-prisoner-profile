import PrisonerLocationDetailsService from './prisonerLocationDetailsService'
import { LocationDetails } from '../interfaces/pages/locationDetailsPageData'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { mockOffenderCellHistory, mockCellHistoryItem1 } from '../data/localMockData/offenderCellHistoryMock'
import AgenciesMock from '../data/localMockData/agenciesDetails'
import StaffDetailsMock from '../data/localMockData/staffDetails'
import { OffenderCellHistoryItem } from '../interfaces/prisonApi/offenderCellHistoryInterface'
import ReceptionsWithCapacityMock from '../data/localMockData/receptionsWithCapacityMock'
import { AgencyDetails } from '../interfaces/prisonApi/agencies'
import { StaffDetails } from '../interfaces/prisonApi/staffDetails'
import { mockInmateAtLocation } from '../data/localMockData/locationsInmates'

describe('prisonerLocationDetailsService', () => {
  let service: PrisonerLocationDetailsService
  let prisonApiClient: PrisonApiClient

  beforeEach(() => {
    prisonApiClient = prisonApiClientMock()
    service = new PrisonerLocationDetailsService(() => prisonApiClient)

    prisonApiClient.getStaffDetails = jest.fn(async (username: string) => generateStaffDetails(username))
    prisonApiClient.getAgencyDetails = jest.fn(async (agencyId: string) => generateAgencyDetails(agencyId))
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getInmatesAtLocation', () => {
    it('returns data about inmates sharing a location', async () => {
      prisonApiClient.getInmatesAtLocation = jest.fn(async () => [mockInmateAtLocation])
      await expect(service.getInmatesAtLocation('', 123)).resolves.toEqual([mockInmateAtLocation])
    })
  })

  describe('isReceptionFull', () => {
    it('returns true when no receptions with capacity', async () => {
      prisonApiClient.getReceptionsWithCapacity = jest.fn(async () => [])
      await expect(service.isReceptionFull('', 'LEI')).resolves.toEqual(true)
    })

    it('returns false when there are receptions with capacity', async () => {
      prisonApiClient.getReceptionsWithCapacity = jest.fn(async () => ReceptionsWithCapacityMock)
      await expect(service.isReceptionFull('', 'LEI')).resolves.toEqual(false)
    })
  })

  describe('getLocationDetailsByLatestFirst', () => {
    it('handles empty list of cell history', async () => {
      prisonApiClient.getOffenderCellHistory = jest.fn(async () => ({ content: [] }))
      await expect(service.getLocationDetailsByLatestFirst('', 123)).resolves.toEqual([])
    })

    it('returns location details in order of latest first', async () => {
      prisonApiClient.getOffenderCellHistory = jest.fn(async () =>
        mockOffenderCellHistory([
          generateCellHistory({ order: 1, agency: 1, livingUnitId: 1, movedInByUsername: 'USER_1' }),
          generateCellHistory({ order: 2, agency: 2, livingUnitId: 1, movedInByUsername: 'USER_2' }),
          generateCellHistory({ order: 3, agency: 3, livingUnitId: 1, movedInByUsername: 'USER_3' }),
        ]),
      )

      // The greater the 'order', the later the date, so we expect the higher 'order' values first:
      await expect(service.getLocationDetailsByLatestFirst('', 123)).resolves.toEqual([
        generateLocation({ order: 3, agency: 3, livingUnitId: 1, movedInBy: 'User 3' }),
        generateLocation({ order: 2, agency: 2, livingUnitId: 1, movedInBy: 'User 2' }),
        generateLocation({ order: 1, agency: 1, livingUnitId: 1, movedInBy: 'User 1' }),
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
          const locationDetails = await service.getLocationDetailsByLatestFirst('', 123)
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
          const locationDetails = await service.getLocationDetailsByLatestFirst('', 123)
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
          name: 'Agency 1',
          fromDateString: '01/01/2024',
          toDateString: '02/01/2024',
          locationDetails: [location],
          isValidAgency: true,
        },
      ])
    })

    it('handles list of locations all in the same agency', () => {
      const location1 = generateLocation({ agency: 1, livingUnitId: 1, order: 1 })
      const location2 = generateLocation({ agency: 1, livingUnitId: 2, order: 2 })
      const location3 = generateLocation({ agency: 1, livingUnitId: 3, order: 3 })

      expect(service.getLocationDetailsGroupedByPeriodAtAgency([location3, location2, location1])).toEqual([
        {
          name: 'Agency 1',
          fromDateString: '01/01/2024',
          toDateString: '04/01/2024',
          locationDetails: [location3, location2, location1],
          isValidAgency: true,
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
          name: 'Agency 3',
          fromDateString: '04/01/2024',
          toDateString: '07/01/2024',
          locationDetails: [location6, location5, location4],
          isValidAgency: true,
        },
        {
          name: 'Agency 2',
          fromDateString: '03/01/2024',
          toDateString: '04/01/2024',
          locationDetails: [location3],
          isValidAgency: true,
        },
        {
          name: 'Agency 1',
          fromDateString: '01/01/2024',
          toDateString: '03/01/2024',
          locationDetails: [location2, location1],
          isValidAgency: true,
        },
      ])
    })

    it('handles returning back to a previous agency', () => {
      const location1 = generateLocation({ agency: 1, livingUnitId: 1, order: 1 })
      const location2 = generateLocation({ agency: 2, livingUnitId: 1, order: 2 })
      const location3 = generateLocation({ agency: 1, livingUnitId: 1, order: 3 })

      expect(service.getLocationDetailsGroupedByPeriodAtAgency([location3, location2, location1])).toEqual([
        {
          name: 'Agency 1',
          fromDateString: '03/01/2024',
          toDateString: '04/01/2024',
          locationDetails: [location3],
          isValidAgency: true,
        },
        {
          name: 'Agency 2',
          fromDateString: '02/01/2024',
          toDateString: '03/01/2024',
          locationDetails: [location2],
          isValidAgency: true,
        },
        {
          name: 'Agency 1',
          fromDateString: '01/01/2024',
          toDateString: '02/01/2024',
          locationDetails: [location1],
          isValidAgency: true,
        },
      ])
    })

    it('marks agencies without a name/description invalid', () => {
      const location: LocationDetails = {
        ...generateLocation({ agency: 1, livingUnitId: 1, order: 1 }),
        establishment: null,
      }
      expect(service.getLocationDetailsGroupedByPeriodAtAgency([location])).toEqual([
        {
          name: null,
          fromDateString: '01/01/2024',
          toDateString: '02/01/2024',
          locationDetails: [location],
          isValidAgency: false,
        },
      ])
    })

    it('sets toDateString as "Unknown" when no assignmentEndDateTime for latest location', () => {
      const location1 = generateLocation({ agency: 1, livingUnitId: 1, order: 1 })
      const location2 = generateLocation({ agency: 1, livingUnitId: 2, order: 2 })
      const location3: LocationDetails = {
        ...generateLocation({ agency: 1, livingUnitId: 3, order: 3 }),
        assignmentEndDateTime: null,
      }
      expect(service.getLocationDetailsGroupedByPeriodAtAgency([location3, location2, location1])).toEqual([
        {
          name: 'Agency 1',
          fromDateString: '01/01/2024',
          toDateString: 'Unknown',
          locationDetails: [location3, location2, location1],
          isValidAgency: true,
        },
      ])
    })
  })
})

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
  movedInByUsername = 'JOHN_SMITH',
}: {
  agency: number
  livingUnitId: number
  order: number
  movedInByUsername?: string
}): OffenderCellHistoryItem => ({
  ...mockCellHistoryItem1,
  agencyId: `AGY${agency}`,
  livingUnitId,
  description: `AGY${agency}-1-1-${livingUnitId}`,
  assignmentDateTime: generateTestDateTime(order),
  assignmentEndDateTime: generateTestDateTime(order + 1),
  movementMadeBy: movedInByUsername,
})

const generateLocation = ({
  agency,
  livingUnitId,
  order,
  movedInBy = 'John Smith',
}: {
  agency: number
  livingUnitId: number
  order: number
  movedInBy?: string
}): LocationDetails => ({
  agencyId: `AGY${agency}`,
  establishment: `Agency ${agency}`,
  livingUnitId,
  location: `1-1-${livingUnitId}`,
  assignmentDateTime: generateTestDateTime(order),
  assignmentEndDateTime: generateTestDateTime(order + 1),
  movedIn: `${order.toString().padStart(2, '0')}/01/2024 - 01:02`,
  movedOut: `${(order + 1).toString().padStart(2, '0')}/01/2024 - 01:02`,
  movedInBy,
  isTemporaryLocation: false,
})

const generateTestDateTime = (dayOfMonth: number) => `2024-01-${dayOfMonth.toString().padStart(2, '0')}T01:02:03`
