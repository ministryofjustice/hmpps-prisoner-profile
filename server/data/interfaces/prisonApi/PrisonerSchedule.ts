export interface PrisonerPrisonSchedule {
  offenderNo: string
  firstName: string
  lastName: string
  event: string
  eventType?: string
  eventDescription: string
  eventLocation: string
  eventStatus: string
  comment: string
  startTime: string
  endTime?: string
}
