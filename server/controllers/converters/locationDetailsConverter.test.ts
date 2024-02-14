import { StaffDetails } from '../../interfaces/prisonApi/staffDetails'
import { LocationDetails, LocationDetailsGroupedByPeriodAtAgency } from '../../services/interfaces/locationDetails'
import {
  GroupedLocationDetailsForDisplay,
  LocationDetailsForDisplay,
} from '../../interfaces/pages/locationDetailsPageData'
import config from '../../config'
import { PrisonerMockDataA } from '../../data/localMockData/prisoner'
import { groupedLocationDetailsConverter, locationDetailsConverter } from './locationDetailsConverter'

describe('locationDetailsConverter', () => {
  describe('convertLocationDetails', () => {
    let convertLocationDetails: (locationDetails: LocationDetails) => LocationDetailsForDisplay

    beforeEach(() => {
      convertLocationDetails = locationDetailsConverter(prisonerNumber, nowDate)
    })

    it('handles null or undefined location details', () => {
      expect(convertLocationDetails(null)).toEqual(null)
      expect(convertLocationDetails(undefined)).toEqual(null)
    })

    it('converts location details with staff details', () => {
      expect(convertLocationDetails(locationDetails)).toEqual(expectedLocationDetailsForDisplay)
    })

    it('converts location details without staff details', () => {
      expect(
        convertLocationDetails({
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
        convertLocationDetails({
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
        convertLocationDetails({
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
          convertLocationDetails({
            ...locationDetails,
            assignmentEndDateTime: endDate,
          }),
        ).toEqual({
          ...expectedLocationDetailsForDisplay,
          movedOut: endDate,
          locationHistoryLink: `${config.serviceUrls.digitalPrison}/prisoner/${prisonerNumber}/location-history?agencyId=MDI&locationId=111111&fromDate=2023-12-01T10%3A20%3A30&toDate=2024-02-03T11%3A22%3A33`,
        })
      },
    )
  })

  describe('convertGroupedLocationDetails', () => {
    let convertGroupedLocationDetails: (
      groupedLocationDetails: LocationDetailsGroupedByPeriodAtAgency,
    ) => GroupedLocationDetailsForDisplay

    beforeEach(() => {
      convertGroupedLocationDetails = groupedLocationDetailsConverter(prisonerNumber, new Date('2024-02-03T11:22:33'))
    })

    it('handles null or undefined groups', () => {
      expect(convertGroupedLocationDetails(null)).toEqual(null)
      expect(convertGroupedLocationDetails(undefined)).toEqual(null)
    })

    it('converts groups', () => {
      expect(
        convertGroupedLocationDetails({
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
const nowDate = new Date('2024-02-03T11:22:33')

const locationDetails: LocationDetails = {
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
  locationHistoryLink: `${config.serviceUrls.digitalPrison}/prisoner/${prisonerNumber}/location-history?agencyId=MDI&locationId=111111&fromDate=2023-12-01T10%3A20%3A30&toDate=2024-01-01T01%3A02%3A03`,
}
