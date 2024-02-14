import { convertGroupedLocationDetails, convertLocationDetails } from './locationDetailsConverter'
import { StaffDetails } from '../../interfaces/prisonApi/staffDetails'
import { LocationDetails } from '../../services/interfaces/locationDetails'
import { LocationDetailsForDisplay } from '../../interfaces/pages/locationDetailsPageData'

describe('locationDetailsConverter', () => {
  describe('convertLocationDetails', () => {
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

    it('converts location details and handles missing dates', () => {
      expect(
        convertLocationDetails({
          ...locationDetails,
          assignmentDateTime: null,
          assignmentEndDateTime: null,
        }),
      ).toEqual({
        ...expectedLocationDetailsForDisplay,
        movedIn: null,
        movedOut: null,
      })
    })
  })

  describe('convertGroupedLocationDetails', () => {
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
            { ...locationDetails, livingUnitId: 1 },
            { ...locationDetails, livingUnitId: 2 },
          ],
        }),
      ).toEqual({
        agencyName: 'Moorland (HMP & YOI)',
        fromDate: '01/12/2023',
        toDate: '01/01/2024',
        locationDetails: [
          { ...expectedLocationDetailsForDisplay, livingUnitId: 1 },
          { ...expectedLocationDetailsForDisplay, livingUnitId: 2 },
        ],
      })
    })

    it('converts location details without staff details', () => {
      expect(
        convertLocationDetails({
          agencyId: 'MDI',
          agencyName: 'Moorland (HMP & YOI)',
          assignmentDateTime: '2023-12-01T10:20:30',
          assignmentEndDateTime: '2024-01-01T01:02:03',
          isTemporaryLocation: false,
          livingUnitId: 2,
          location: '1-1-1',
          movementMadeByUsername: 'USER_1',
          movementMadeByStaffDetails: undefined,
        }),
      ).toEqual({
        agencyId: 'MDI',
        establishment: 'Moorland (HMP & YOI)',
        movedIn: '01/12/2023 - 10:20',
        movedOut: '01/01/2024 - 01:02',
        isTemporaryLocation: false,
        livingUnitId: 2,
        location: '1-1-1',
        movedInBy: 'USER_1',
      })
    })

    it('converts location details and handles missing dates', () => {
      expect(
        convertLocationDetails({
          agencyId: 'MDI',
          agencyName: 'Moorland (HMP & YOI)',
          assignmentDateTime: null,
          assignmentEndDateTime: null,
          isTemporaryLocation: false,
          livingUnitId: 2,
          location: '1-1-1',
          movementMadeByUsername: 'USER_1',
          movementMadeByStaffDetails: { firstName: 'JOHN', lastName: 'SMITH' } as StaffDetails,
        }),
      ).toEqual({
        agencyId: 'MDI',
        establishment: 'Moorland (HMP & YOI)',
        movedIn: null,
        movedOut: null,
        isTemporaryLocation: false,
        livingUnitId: 2,
        location: '1-1-1',
        movedInBy: 'John Smith',
      })
    })
  })
})

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
  agencyId: 'MDI',
  establishment: 'Moorland (HMP & YOI)',
  movedIn: '01/12/2023 - 10:20',
  movedOut: '01/01/2024 - 01:02',
  isTemporaryLocation: false,
  livingUnitId: 111111,
  location: '1-1-1',
  movedInBy: 'John Smith',
}
