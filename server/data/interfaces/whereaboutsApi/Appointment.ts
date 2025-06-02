import { SelectOption } from '../../../utils/utils'

export default interface Appointment {
  appointmentType: string
  location: string
  date: string
  startTimeHours: string
  startTimeMinutes: string
  endTimeHours: string
  endTimeMinutes: string
  recurring: 'yes' | 'no'
  repeats: RepeatPeriod
  times: number
  comments: string
  bookingId: number
}

export interface AppointmentDetails {
  appointment: {
    id: number
    agencyId: string
    locationId: number
    appointmentTypeCode: string
    offenderNo: string
    startTime: string
    endTime?: string
    comment?: string
  }
  recurring?: {
    id: number
    repeatPeriod: string
    count: number
    startTime: string
  }
}

export interface AppointmentForm {
  appointmentId?: number
  appointmentType?: string
  probationTeam?: string
  location?: string
  officerDetailsNotKnown?: string
  officerFullName?: string
  officerEmail?: string
  officerTelephone?: string
  meetingType?: string
  date?: string
  startTimeHours?: string
  startTimeMinutes?: string
  endTimeHours?: string
  endTimeMinutes?: string
  recurring?: 'yes' | 'no'
  repeats?: RepeatPeriod
  times?: number
  comments?: string
  bookingId?: number
  prisonId?: string
  dpsLocationId?: string
  notesForStaff?: string
  notesForPrisoners?: string
}

export interface AppointmentDefaults {
  bookingId: number
  appointmentType: string
  locationId: number
  startTime: string
  endTime: string
  comment?: string
  repeat?: {
    repeatPeriod: RepeatPeriod
    count: number
  }
}

export interface PrePostAppointmentDetails {
  appointmentId?: number
  appointmentDefaults: AppointmentDefaults // Summary details
  appointmentForm: AppointmentForm // The original appointment form
  // PrePost Form values
  formValues?: {
    bookingType: string
    preAppointment?: string
    preAppointmentLocation?: string
    postAppointment?: string
    postAppointmentLocation?: string
    court?: string
    hearingType?: string
    cvpRequired?: string
    videoLinkUrl?: string
  }
}

export type RepeatPeriod = 'DAILY' | 'WEEKDAYS' | 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY'

export const repeatOptions: SelectOption[] = [
  { value: 'DAILY', text: 'Daily' },
  { value: 'WEEKDAYS', text: 'Weekday (Monday to Friday)' },
  { value: 'WEEKLY', text: 'Weekly' },
  { value: 'FORTNIGHTLY', text: 'Fortnightly' },
  { value: 'MONTHLY', text: 'Monthly' },
]
