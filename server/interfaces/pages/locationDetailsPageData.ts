import PreviousLocation from '../prisonApi/previousLocation'

export interface LocationDetailsCurrentLocation {
  agencyId: string
  assignmentDateTime: string
  assignmentEndDateTime: string
  establishment: string
  isTemporaryLocation: boolean
  livingUnitId: number
  location: string
  movedIn: string
  movedInBy: string
  movedOut: string
}

export interface LocationDetailsOccupant {
  name: string
  profileUrl: string
}

export interface LocationWithAgencyLeaveDate extends PreviousLocation {
  establishmentWithAgencyLeaveDate: string
}

export interface CellHistoryGroupedByPeriodAtAgency {
  isValidAgency: boolean
  name: string
  datePeriod: string
  cellHistory: LocationWithAgencyLeaveDate[]
  key: string
}

export interface LocationDetailsPageData {
  pageTitle: string
  name: string
  prisonerName: string
  breadcrumbPrisonerName: string
  prisonerNumber: string
  prisonId: string
  currentLocation: LocationDetailsCurrentLocation
  occupants: LocationDetailsOccupant[]
  cellHistoryGroupedByAgency: CellHistoryGroupedByPeriodAtAgency[]
  profileUrl: string
  dpsBaseUrl: string
  changeCellLink: string
  moveToReceptionLink: string
  canViewCellMoveButton: boolean
  canViewMoveToReceptionButton: boolean
}
