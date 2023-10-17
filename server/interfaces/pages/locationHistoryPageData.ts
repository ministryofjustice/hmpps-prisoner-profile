export default interface LocationHistoryPageData {
  locationDetails: {
    description: string
    movedIn: string
    movedOut: string
    movedBy: string
    reasonForMove: string
    whatHappened: string
    attributes: { code: string; description: string }[]
  }
  locationSharingHistory: {
    shouldLink: boolean
    name: string
    number: string
    movedIn: string
    movedOut: string
  }[]
  prisonerName: string
  locationName: string
  prisonerNumber: string
}
