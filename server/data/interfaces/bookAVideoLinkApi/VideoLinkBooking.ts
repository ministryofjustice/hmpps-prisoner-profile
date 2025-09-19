export default interface CreateVideoBookingRequest {
  bookingType: 'COURT' | 'PROBATION'
  prisoners: PrisonerDetails[]
  courtCode?: string
  courtHearingType?: string
  probationTeamCode?: string
  probationMeetingType?: string
  comments?: string
  videoLinkUrl?: string
  hmctsNumber?: string
  guestPin?: string
  additionalBookingDetails?: {
    contactName: string
    contactEmail: string
    contactNumber?: string
  }
  notesForStaff?: string
  notesForPrisoners?: string
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface AmendVideoBookingRequest extends CreateVideoBookingRequest {}

interface PrisonerDetails {
  prisonCode: string
  prisonerNumber: string
  appointments: Appointment[]
}

interface Appointment {
  type: 'VLB_COURT_PRE' | 'VLB_COURT_MAIN' | 'VLB_COURT_POST'
  locationKey: string
  date: string
  startTime: string
  endTime: string
}

export interface VideoBookingSearchRequest {
  prisonerNumber: string
  locationKey: string
  date: string
  startTime: string
  endTime: string
}

export interface VideoLinkBooking {
  videoLinkBookingId: number
  statusCode: string
  bookingType: string
  prisonAppointments: {
    prisonCode: string
    prisonerNumber: string
    appointmentType: string
    comments?: string
    prisonLocKey: string
    appointmentDate: string
    startTime: string
    endTime: string
  }[]
  courtCode?: string
  courtDescription?: string
  courtHearingType?: string
  courtHearingTypeDescription?: string
  probationTeamCode?: string
  probationTeamDescription?: string
  probationMeetingType?: string
  probationMeetingTypeDescription?: string
  comments?: string
  videoLinkUrl?: string
  hmctsNumber?: string
  guestPin?: string
  additionalBookingDetails?: {
    contactName?: string
    contactEmail?: string
    contactNumber?: string
  }
  notesForStaff?: string
  notesForPrisoners?: string
}
