export interface PrisonerSchedule {
  offenderNo: string
  eventId: number
  bookingId: number
  locationId: number
  firstName: string
  lastName: string
  cellLocation: string
  event: string
  eventType: string
  eventDescription: string
  eventLocation: string
  eventLocationId: number
  eventStatus: string
  comment: string
  startTime: string
  endTime: string
  eventOutcome: string
  performance: string
  outcomeComment: string
  paid: boolean
  payRate: number
  excluded: boolean
  timeSlot: TimeSlot
  locationCode: string
  suspended: boolean
}

export type TimeSlot = 'AM' | 'PM' | 'ED'
