export interface LocationDetailsOccupant {
  name: string
  profileUrl: string
}

export interface LocationDetailsForDisplay {
  agencyId: string
  establishment: string
  location: string
  livingUnitId: number
  isTemporaryLocation: boolean
  movedIn: string
  movedInBy: string
  movedOut: string
}

export interface GroupedLocationDetailsForDisplay {
  agencyName: string
  fromDate: string
  toDate: string
  locationDetails: LocationDetailsForDisplay[]
}

export interface LocationDetailsPageData {
  pageTitle: string
  name: string
  prisonerName: string
  breadcrumbPrisonerName: string
  prisonerNumber: string
  prisonId: string
  currentLocation?: LocationDetailsForDisplay
  occupants: LocationDetailsOccupant[]
  locationDetailsGroupedByAgency: GroupedLocationDetailsForDisplay[]
  profileUrl: string
  dpsBaseUrl: string
  changeCellLink: string
  moveToReceptionLink: string
  canViewCellMoveButton: boolean
  canViewMoveToReceptionButton: boolean
  isTransfer: boolean
  isReleased: boolean
}
