export default interface ScheduledEvent {
  bookingId?: number
  eventClass?: string
  eventId?: number
  eventStatus?: string
  eventType?: string
  eventTypeDesc?: string
  eventSubType?: string
  eventSubTypeDesc?: string
  eventDate?: string
  startTime?: string
  endTime?: string
  eventLocation?: string
  eventLocationId?: number
  agencyId?: string
  eventSource?: string
  eventSourceCode?: string
  eventSourceDesc?: string
  eventOutcome?: string
  performance?: string
  outcomeComment?: string
  paid?: boolean
  payRate?: number
  locationCode?: string
  createUserId?: string
  comment?: string
  type?: string
  shortComment?: string
  cancelled?: boolean
  name?: string
}

export interface SelectedWeekDates {
  date?: string
  periods?: {
    morningActivities: {
      comment: string
      startTime: string
      endTime: string
      eventStatus: string
      type: string
      shortComment: string
      cancelled: boolean
    }[]
    afternoonActivities: {
      comment: string
      startTime: string
      endTime: string
      eventStatus: string
      type: string
      shortComment: string
      cancelled: boolean
    }[]
    eveningActivities: {
      comment: string
      startTime: string
      endTime: string
      eventStatus: string
      type: string
      shortComment: string
      cancelled: boolean
    }[]
  }
}
