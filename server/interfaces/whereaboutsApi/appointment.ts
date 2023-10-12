import { SelectOption } from '../../utils/utils'

export interface Appointment {
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
    preAppointmentLocation?: number
    postAppointment?: string
    postAppointmentLocation?: number
    court?: string
    otherCourt?: string
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
