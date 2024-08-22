export default interface CreateVideoBookingRequest {
  bookingType: 'COURT' | 'PROBATION'
  prisoners: PrisonerDetails[]
  courtCode?: string
  courtHearingType?: string
  probationTeamCode?: string
  probationMeetingType?: string
  comments?: string
  videoLinkUrl?: string
}

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
