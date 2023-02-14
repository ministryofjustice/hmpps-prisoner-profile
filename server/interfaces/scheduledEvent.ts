export type ScheduledEvent = {
  agencyId?: string
  bookingId: number
  createUserId?: string
  endTime?: string
  eventClass: string
  eventDate: string
  eventId?: number
  eventLocationId?: number
  eventLocation?: string
  eventOutcome?: string
  eventSourceCode?: string
  eventSourceDesc?: string
  eventSource: string
  eventStatus: string
  eventSubTypeDesc: string
  eventSubType: string
  eventTypeDesc: string
  eventType: string
  locationCode?: string
  outcomeComment?: string
  paid?: boolean
  payRate?: number
  performance?: string
  startTime?: string
}
