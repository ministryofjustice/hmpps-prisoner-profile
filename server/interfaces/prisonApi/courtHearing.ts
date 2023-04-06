export interface CourtHearing {
  id: number
  dateTime: string
  location: {
    agencyId: string
    description: string
    longDescription: string
    agencyType: string
    active: boolean
    courtType: string
  }
}
