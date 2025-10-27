import { addDays, addYears, subDays } from 'date-fns'
import { AppointmentValidator } from './appointmentValidator'
import { formatDate, formatDateISO } from '../utils/dateHelpers'

const todayStr = formatDate(formatDateISO(new Date()), 'short')
const futureDate = formatDateISO(addDays(new Date(), 7))
const futureDateYear = formatDateISO(addYears(new Date(), 1))

describe('Validation middleware - VLPM appointment', () => {
  it('should pass validation with good data', async () => {
    const appointmentForm = {
      appointmentType: 'VLPM',
      probationTeam: 'TEAM_CODE',
      location: '27000',
      officerDetailsNotKnown: 'true',
      meetingType: 'MEETING_TYPE',
      date: formatDate(futureDate, 'short'),
      startTimeHours: '10',
      startTimeMinutes: '30',
      endTimeHours: '11',
      endTimeMinutes: '30',
      recurring: 'yes',
      repeats: 'DAILY',
      times: '1',
      comments: 'Comments',
    }

    const result = AppointmentValidator(appointmentForm)

    expect(result).toEqual([])
  })

  it('should fail validation for notes when max characters exceeded for BVLS VLPM appointment', async () => {
    const appointmentForm = {
      appointmentType: 'VLPM',
      probationTeam: 'TEAM_CODE',
      location: '27000',
      officerDetailsNotKnown: 'true',
      meetingType: 'MEETING_TYPE',
      date: formatDate(futureDate, 'short'),
      startTimeHours: '10',
      startTimeMinutes: '30',
      endTimeHours: '11',
      endTimeMinutes: '30',
      recurring: 'yes',
      repeats: 'DAILY',
      times: '1',
      notesForStaff: 'a'.repeat(401),
      notesForPrisoners: 'a'.repeat(401),
      comments: 'a'.repeat(3601),
    }

    const result = AppointmentValidator(appointmentForm)

    expect(result).toEqual([
      { text: 'Notes for prison staff must be 400 characters or less', href: '#notesForStaff' },
      { text: 'Notes for prisoner must be 400 characters or less', href: '#notesForPrisoners' },
    ])
  })

  it('should fail validation for notes when max characters exceeded for BVLS VLB appointment', async () => {
    const appointmentForm = {
      appointmentType: 'VLB',
      probationTeam: 'TEAM_CODE',
      location: '27000',
      officerDetailsNotKnown: 'true',
      meetingType: 'MEETING_TYPE',
      date: formatDate(futureDate, 'short'),
      startTimeHours: '10',
      startTimeMinutes: '30',
      endTimeHours: '11',
      endTimeMinutes: '30',
      recurring: 'yes',
      repeats: 'DAILY',
      times: '1',
      notesForStaff: 'a'.repeat(401),
      notesForPrisoners: 'a'.repeat(401),
      comments: 'a'.repeat(3601),
    }

    const result = AppointmentValidator(appointmentForm)

    expect(result).toEqual([
      { text: 'Notes for prison staff must be 400 characters or less', href: '#notesForStaff' },
      { text: 'Notes for prisoner must be 400 characters or less', href: '#notesForPrisoners' },
    ])
  })

  it('should fail validation with no data', async () => {
    const appointmentForm = {
      appointmentType: '',
      location: '',
      date: '',
      startTimeHours: '',
      startTimeMinutes: '',
      endTimeHours: '',
      endTimeMinutes: '',
      recurring: '',
      repeats: '',
      times: '',
      comments: '',
    }

    const result = AppointmentValidator(appointmentForm)

    expect(result).toEqual([
      { text: 'Select the appointment type', href: '#appointmentType' },
      { text: 'Select the location', href: '#location' },
      { text: 'Select the date', href: '#date' },
      { text: 'Enter the start time', href: '#startTime' },
      { text: 'Enter the end time', href: '#endTime' },
      { text: 'Select if this is a recurring appointment or not', href: '#recurring' },
    ])
  })

  it('should fail validation with no data for VLPM type', async () => {
    const appointmentForm = {
      appointmentType: 'VLPM',
      location: '27000',
      date: formatDate(futureDate, 'short'),
      startTimeHours: '10',
      startTimeMinutes: '30',
      endTimeHours: '11',
      endTimeMinutes: '30',
      recurring: 'yes',
      repeats: 'DAILY',
      times: '1',
      comments: 'Comments',
    }

    const result = AppointmentValidator(appointmentForm)

    expect(result).toEqual([
      {
        href: '#probationTeam',
        text: 'Select the probation team',
      },
      {
        href: '#officerDetailsOrUnknown',
        text: 'Enter the probation officer’s details',
      },
      {
        href: '#meetingType',
        text: 'Select the meeting type',
      },
    ])
  })

  it('should fail validation when both not yet known selected and some officer details entered', async () => {
    const appointmentForm = {
      appointmentType: 'VLPM',
      probationTeam: 'TEAM_CODE',
      location: '27000',
      officerDetailsNotKnown: 'true',
      officerFullName: 'Test name',
      officerEmail: 'Test email',
      meetingType: 'MEETING_TYPE',
      date: formatDate(futureDate, 'short'),
      startTimeHours: '10',
      startTimeMinutes: '30',
      endTimeHours: '11',
      endTimeMinutes: '30',
      recurring: 'yes',
      repeats: 'DAILY',
      times: '1',
      comments: 'Comments',
    }

    const result = AppointmentValidator(appointmentForm)

    expect(result).toEqual([
      {
        href: '#officerDetailsOrUnknown',
        text: "Enter either the probation officer’s details, or select 'Not yet known'",
      },
    ])
  })

  it('should fail validation when officer details are not entered', async () => {
    const appointmentForm = {
      appointmentType: 'VLPM',
      probationTeam: 'TEAM_CODE',
      location: '27000',
      officerFullName: '',
      officerEmail: '',
      officerTelephone: '07777777777',
      meetingType: 'MEETING_TYPE',
      date: formatDate(futureDate, 'short'),
      startTimeHours: '10',
      startTimeMinutes: '30',
      endTimeHours: '11',
      endTimeMinutes: '30',
      recurring: 'yes',
      repeats: 'DAILY',
      times: '1',
      comments: 'Comments',
    }

    const result = AppointmentValidator(appointmentForm)

    expect(result).toEqual([
      {
        href: '#officerFullName',
        text: 'Enter the probation officer’s full name',
      },
      {
        href: '#officerEmail',
        text: 'Enter the probation officer’s email address',
      },
    ])
  })

  it('should fail validation when for an invalid email and phone number', async () => {
    const appointmentForm = {
      appointmentType: 'VLPM',
      probationTeam: 'TEAM_CODE',
      location: '27000',
      officerFullName: 'Test name',
      officerEmail: 'invalid',
      officerTelephone: 'invalid',
      meetingType: 'MEETING_TYPE',
      date: formatDate(futureDate, 'short'),
      startTimeHours: '10',
      startTimeMinutes: '30',
      endTimeHours: '11',
      endTimeMinutes: '30',
      recurring: 'yes',
      repeats: 'DAILY',
      times: '1',
      comments: 'Comments',
    }

    const result = AppointmentValidator(appointmentForm)

    expect(result).toEqual([
      {
        href: '#officerEmail',
        text: "'Enter a valid email address'",
      },
      {
        href: '#officerTelephone',
        text: 'Enter a valid UK phone number',
      },
    ])
  })

  it('should fail validation with bad data', async () => {
    const appointmentForm = {
      appointmentType: 'VLB',
      location: 'X',
      date: '34/99/1234',
      startTimeHours: '77',
      startTimeMinutes: '77',
      endTimeHours: 'aa',
      endTimeMinutes: 'bb',
      recurring: 'yes',
      repeats: '',
      times: 'aa',
      notesForStaff: 'a'.repeat(401),
      notesForPrisoners: 'a'.repeat(401),
    }

    const result = AppointmentValidator(appointmentForm)

    expect(result).toEqual([
      { text: `Enter a real date in the format DD/MM/YYYY - for example, ${todayStr}`, href: '#date' },
      { text: 'Enter an hour which is 23 or less', href: '#startTime' },
      { text: 'Enter the minutes using 59 or less', href: '#startTime' },
      { text: 'Enter an hour using numbers only', href: '#endTime' },
      { text: 'Enter the minutes using numbers only', href: '#endTime' },
      { text: 'Select the repeat period for this appointment', href: '#repeats' },
      { text: 'Enter the number of appointments using numbers only', href: '#times' },
      { text: 'Notes for prison staff must be 400 characters or less', href: '#notesForStaff' },
      { text: 'Notes for prisoner must be 400 characters or less', href: '#notesForPrisoners' },
    ])
  })

  it('should fail validation with date in past', async () => {
    const appointmentForm = {
      appointmentType: 'X',
      location: 'X',
      date: '01/01/2000',
      startTimeHours: '10',
      startTimeMinutes: '00',
      endTimeHours: '11',
      endTimeMinutes: '30',
      recurring: 'no',
      repeats: 'DAILY',
      times: '1',
      comments: '',
    }

    const result = AppointmentValidator(appointmentForm)

    expect(result).toEqual([
      {
        text: `Enter a date which is not in the past in the format DD/MM/YYYY - for example, ${todayStr}`,
        href: '#date',
      },
    ])
  })

  it('should fail validation with date beyond a year in the future', async () => {
    const appointmentForm = {
      appointmentType: 'VLPM',
      probationTeam: 'TEAM_CODE',
      location: '27000',
      officerDetailsNotKnown: 'true',
      meetingType: 'MEETING_TYPE',
      date: formatDate(futureDateYear, 'short'),
      startTimeHours: '10',
      startTimeMinutes: '30',
      endTimeHours: '11',
      endTimeMinutes: '30',
      recurring: 'yes',
      repeats: 'DAILY',
      times: '1',
      comments: 'Comments',
    }

    const result = AppointmentValidator(appointmentForm)

    const dayBefore = formatDate(formatDateISO(subDays(new Date(futureDateYear), 1)), 'short')
    expect(result).toEqual([
      {
        text: `Enter a date which is on or before ${dayBefore}`,
        href: '#date',
      },
    ])
  })

  it('should pass validation with date befpre a year in the future', async () => {
    const dayBeforeFutureDateYear = formatDateISO(subDays(new Date(futureDateYear), 1))
    const appointmentForm = {
      appointmentType: 'VLPM',
      probationTeam: 'TEAM_CODE',
      location: '27000',
      officerDetailsNotKnown: 'true',
      meetingType: 'MEETING_TYPE',
      date: formatDate(dayBeforeFutureDateYear, 'short'),
      startTimeHours: '10',
      startTimeMinutes: '30',
      endTimeHours: '11',
      endTimeMinutes: '30',
      recurring: 'yes',
      repeats: 'DAILY',
      times: '1',
      comments: 'Comments',
    }

    const result = AppointmentValidator(appointmentForm)

    expect(result).toEqual([])
  })

  it('should fail validation with a time in past', async () => {
    const appointmentForm = {
      appointmentType: 'X',
      location: 'X',
      date: todayStr,
      startTimeHours: '01',
      startTimeMinutes: '00',
      endTimeHours: '02',
      endTimeMinutes: '00',
      recurring: 'no',
      repeats: 'DAILY',
      times: '1',
      comments: '',
    }

    const result = AppointmentValidator(appointmentForm)

    expect(result).toEqual([
      {
        text: `Enter a start time which is not in the past`,
        href: '#startTime',
      },
      {
        text: `Enter an end time which is not in the past`,
        href: '#endTime',
      },
    ])
  })

  it('should fail validation with end time before start time', async () => {
    const appointmentForm = {
      appointmentType: 'X',
      location: 'X',
      date: formatDate(futureDate, 'short'),
      startTimeHours: '10',
      startTimeMinutes: '00',
      endTimeHours: '09',
      endTimeMinutes: '00',
      recurring: 'no',
      repeats: 'DAILY',
      times: '1',
      comments: '',
    }

    const result = AppointmentValidator(appointmentForm)

    expect(result).toEqual([
      {
        text: `The end time must be after the start time`,
        href: '#endTime',
      },
    ])
  })

  it('should fail validation if appointments extend beyond 1 year', async () => {
    const appointmentForm = {
      appointmentType: 'X',
      location: 'X',
      date: formatDate(futureDate, 'short'),
      startTimeHours: '10',
      startTimeMinutes: '00',
      endTimeHours: '11',
      endTimeMinutes: '00',
      recurring: 'yes',
      repeats: 'MONTHLY',
      times: '13',
      comments: '',
    }

    const result = AppointmentValidator(appointmentForm)

    expect(result).toEqual([
      {
        text: `Select fewer number of appointments - you can only add them for a maximum of 1 year`,
        href: '#times',
      },
    ])
  })

  it('should fail validation with WEEKDAY repeats starting on a weekend', async () => {
    const nextWeekendDate = formatDateISO(addDays(new Date(), 6 - new Date().getDay() || 7))
    const appointmentForm = {
      appointmentType: 'VLPM',
      probationTeam: 'TEAM_CODE',
      location: '27000',
      officerDetailsNotKnown: 'true',
      meetingType: 'MEETING_TYPE',
      date: formatDate(nextWeekendDate, 'short'),
      startTimeHours: '10',
      startTimeMinutes: '30',
      endTimeHours: '11',
      endTimeMinutes: '30',
      recurring: 'yes',
      repeats: 'WEEKDAYS',
      times: '1',
      comments: 'Comments',
    }

    const result = AppointmentValidator(appointmentForm)

    expect(result).toEqual([
      {
        href: '#repeats',
        text: 'This weekend appointment cannot be repeated on a weekday (Monday to Friday). Select to repeat it daily, weekly, fortnightly or monthly',
      },
    ])
  })
})
