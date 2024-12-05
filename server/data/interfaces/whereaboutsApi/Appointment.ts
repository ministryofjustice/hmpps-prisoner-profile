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

export interface AppointmentForm {
  appointmentType?: string
  location?: string
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
  dpsLocationId?: string
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
  appointmentDefaults: AppointmentDefaults // Summary details
  appointmentForm: AppointmentForm // The original appointment form
  // PrePost Form values
  formValues?: {
    preAppointment?: string
    preAppointmentLocation?: string
    postAppointment?: string
    postAppointmentLocation?: string
    court?: string
    otherCourt?: string
    hearingType?: string
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
