export interface LocationDetailsOccupant {
  name: string
  profileUrl: string
}

export interface LocationDetailsForDisplay {
  establishment: string
  location: string
  movedIn: string
  movedInBy: string
  movedOut?: string
  locationHistoryLink?: string
}

export interface GroupedLocationDetailsForDisplay {
  agencyName: string
  fromDate: string
  toDate: string
  locationDetails: LocationDetailsForDisplay[]
}

export default interface LocationDetailsPageData {
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
  changeCellLink: string
  moveToReceptionLink: string
  canViewCellMoveButton: boolean
  canViewMoveToReceptionButton: boolean
  isTransfer: boolean
  isReleased: boolean
}
