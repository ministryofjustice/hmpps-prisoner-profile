import PrisonerLocationDetailsPageService from './prisonerLocationDetailsPageService'
import { locationDetailsMock } from '../data/localMockData/locationDetailsPageMock'
import { LocationDetails } from '../interfaces/pages/locationDetailsPageData'

const generateLocation = ({
  agency,
  location,
  order,
}: {
  agency: number
  location: number
  order: number
}): LocationDetails => ({
  ...locationDetailsMock,
  agencyId: `AGY${agency}`,
  establishment: `Agency ${agency}`,
  livingUnitId: location,
  assignmentDateTime: `2024-01-${order.toString().padStart(2, '0')}T01:02:03`,
  assignmentEndDateTime: `2024-01-${(order + 1).toString().padStart(2, '0')}T01:02:03`,
})

describe('prisonerLocationDetailsService', () => {
  let service: PrisonerLocationDetailsPageService

  beforeEach(() => {
    service = new PrisonerLocationDetailsPageService()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getLocationDetailsGroupedByPeriodAtAgency', () => {
    it('handles empty list', () => {
      expect(service.getLocationDetailsGroupedByPeriodAtAgency([])).toEqual([])
    })

    it('handles list of one', () => {
      const location = generateLocation({ agency: 1, location: 1, order: 1 })
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
      const location1 = generateLocation({ agency: 1, location: 1, order: 1 })
      const location2 = generateLocation({ agency: 1, location: 2, order: 2 })
      const location3 = generateLocation({ agency: 1, location: 3, order: 3 })

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
      const location1 = generateLocation({ agency: 1, location: 1, order: 1 })
      const location2 = generateLocation({ agency: 1, location: 2, order: 2 })
      const location3 = generateLocation({ agency: 2, location: 1, order: 3 })
      const location4 = generateLocation({ agency: 3, location: 1, order: 4 })
      const location5 = generateLocation({ agency: 3, location: 2, order: 5 })
      const location6 = generateLocation({ agency: 3, location: 3, order: 6 })

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
      const location1 = generateLocation({ agency: 1, location: 1, order: 1 })
      const location2 = generateLocation({ agency: 2, location: 1, order: 2 })
      const location3 = generateLocation({ agency: 1, location: 1, order: 3 })

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
        ...generateLocation({ agency: 1, location: 1, order: 1 }),
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
      const location1 = generateLocation({ agency: 1, location: 1, order: 1 })
      const location2 = generateLocation({ agency: 1, location: 2, order: 2 })
      const location3: LocationDetails = {
        ...generateLocation({ agency: 1, location: 3, order: 3 }),
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
