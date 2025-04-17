import StaffDetails from '../../../data/interfaces/prisonApi/StaffDetails'

export default interface LocationDetails {
  prisonerNumber: string
  agencyId: string
  agencyName: string
  livingUnitId: number
  location: string
  isTemporaryLocation: boolean
  assignmentDateTime: string
  assignmentEndDateTime: string
  movementMadeByUsername: string
  movementMadeByStaffDetails?: StaffDetails
}

export interface LocationDetailsGroupedByPeriodAtAgency {
  agencyName: string
  fromDate: string
  toDate: string
  locationDetails: LocationDetails[]
}
