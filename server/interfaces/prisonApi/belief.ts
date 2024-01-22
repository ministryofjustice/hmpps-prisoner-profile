export interface Belief {
  bookingId: number
  beliefId: number
  beliefCode: string
  beliefDescription: string
  startDate: string
  endDate?: string
  changeReason: boolean
  comments: string
  addedByFirstName: string
  addedByLastName: string
  updatedByFirstName?: string
  updatedByLastName?: string
  updatedDate?: string
  verified?: boolean
}
