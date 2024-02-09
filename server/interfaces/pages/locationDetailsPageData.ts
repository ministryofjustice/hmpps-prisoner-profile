export interface LocationDetails {
  establishment: string
  location: string
  isTemporaryLocation: boolean
  movedIn: string
  movedOut: string
  assignmentDateTime: string
  assignmentEndDateTime: string
  livingUnitId: number
  agencyId: string
  movedInBy: string
}

export interface LocationDetailsOccupant {
  name: string
  profileUrl: string
}

export interface LocationDetailsGroupedByPeriodAtAgency {
  name: string
  fromDateString: string
  toDateString: string
  locationDetails: LocationDetails[]
  isValidAgency: boolean
}

export interface LocationDetailsPageData {
  pageTitle: string
  name: string
  prisonerName: string
  breadcrumbPrisonerName: string
  prisonerNumber: string
  prisonId: string
  currentLocation: LocationDetails
  occupants: LocationDetailsOccupant[]
  locationDetailsGroupedByAgency: LocationDetailsGroupedByPeriodAtAgency[]
  profileUrl: string
  dpsBaseUrl: string
  changeCellLink: string
  moveToReceptionLink: string
  canViewCellMoveButton: boolean
  canViewMoveToReceptionButton: boolean
  isTransfer: boolean
  isReleased: boolean
}
