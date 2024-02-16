import { StaffDetails } from '../../interfaces/prisonApi/staffDetails'
import { LocationDetails, LocationDetailsGroupedByPeriodAtAgency } from '../../services/interfaces/locationDetails'
import {
  GroupedLocationDetailsForDisplay,
  LocationDetailsForDisplay,
} from '../../interfaces/pages/locationDetailsPageData'
import { PrisonerMockDataA } from '../../data/localMockData/prisoner'
import LocationDetailsConverter from './locationDetailsConverter'

describe('locationDetailsConverter', () => {
  let locationDetailsConverter: LocationDetailsConverter

  beforeEach(() => {
    locationDetailsConverter = new LocationDetailsConverter(() => now)
  })

  describe('convertLocationDetails', () => {
    let convert: (location: LocationDetails) => LocationDetailsForDisplay

    beforeEach(() => {
      convert = location => locationDetailsConverter.convertLocationDetails(location)
    })

    it.each([null, undefined])('handles null or undefined location details', locationDetails => {
      expect(convert(locationDetails)).toEqual(null)
    })

    it('converts location details with staff details', () => {
      expect(convert(locationDetails)).toEqual(expectedLocationDetailsForDisplay)
    })

    it('converts location details without staff details', () => {
      expect(
        convert({
          ...locationDetails,
          movementMadeByStaffDetails: undefined,
        }),
      ).toEqual({
        ...expectedLocationDetailsForDisplay,
        movedInBy: 'USER_1',
      })
    })

    it.each([null, undefined])('converts location details and handles missing start date', startDate => {
      expect(
        convert({
          ...locationDetails,
          assignmentDateTime: startDate,
        }),
      ).toEqual({
        ...expectedLocationDetailsForDisplay,
        movedIn: startDate,
        locationHistoryLink: null,
      })
    })

    it('temporary location details do not include a location history link', () => {
      expect(
        convert({
          ...locationDetails,
          isTemporaryLocation: true,
        }),
      ).toEqual({
        ...expectedLocationDetailsForDisplay,
        locationHistoryLink: null,
      })
    })

    it.each([null, undefined])(
      'location details without end date uses default date (now) in location history link',
      endDate => {
        expect(
          convert({
            ...locationDetails,
            assignmentEndDateTime: endDate,
          }),
        ).toEqual({
          ...expectedLocationDetailsForDisplay,
          movedOut: endDate,
          locationHistoryLink: `/prisoner/${prisonerNumber}/location-history?agencyId=MDI&locationId=111111&fromDate=2023-12-01T10%3A20%3A30&toDate=2024-02-03T11%3A22%3A33`,
        })
      },
    )
  })

  describe('convertGroupedLocationDetails', () => {
    let convert: (groupedLocation: LocationDetailsGroupedByPeriodAtAgency) => GroupedLocationDetailsForDisplay

    beforeEach(() => {
      convert = location => locationDetailsConverter.convertGroupedLocationDetails(location)
    })

    it.each([null, undefined])('handles null or undefined groups', group => {
      expect(convert(group)).toEqual(null)
    })

    it('converts groups', () => {
      expect(
        convert({
          agencyName: 'Moorland (HMP & YOI)',
          fromDate: '2023-12-01T10:20:30',
          toDate: '2024-01-01T01:02:03',
          locationDetails: [
            { ...locationDetails, location: '1-1-1' },
            { ...locationDetails, location: '1-1-2' },
          ],
        }),
      ).toEqual({
        agencyName: 'Moorland (HMP & YOI)',
        fromDate: '01/12/2023',
        toDate: '01/01/2024',
        locationDetails: [
          { ...expectedLocationDetailsForDisplay, location: '1-1-1' },
          { ...expectedLocationDetailsForDisplay, location: '1-1-2' },
        ],
      })
    })
  })
})

const { prisonerNumber } = PrisonerMockDataA
const now = new Date('2024-02-03T11:22:33')

const locationDetails: LocationDetails = {
  prisonerNumber,
  agencyId: 'MDI',
  agencyName: 'Moorland (HMP & YOI)',
  assignmentDateTime: '2023-12-01T10:20:30',
  assignmentEndDateTime: '2024-01-01T01:02:03',
  isTemporaryLocation: false,
  livingUnitId: 111111,
  location: '1-1-1',
  movementMadeByUsername: 'USER_1',
  movementMadeByStaffDetails: { firstName: 'JOHN', lastName: 'SMITH' } as StaffDetails,
}

const expectedLocationDetailsForDisplay: LocationDetailsForDisplay = {
  establishment: 'Moorland (HMP & YOI)',
  movedIn: '01/12/2023 - 10:20',
  movedOut: '01/01/2024 - 01:02',
  location: '1-1-1',
  movedInBy: 'John Smith',
  locationHistoryLink: `/prisoner/${prisonerNumber}/location-history?agencyId=MDI&locationId=111111&fromDate=2023-12-01T10%3A20%3A30&toDate=2024-01-01T01%3A02%3A03`,
}
