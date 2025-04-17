/* eslint-disable no-restricted-globals */
import { addYears, isAfter, isBefore, isPast, isWeekend, subDays } from 'date-fns'
import { isValidPhoneNumber } from 'libphonenumber-js'
import { Validator } from '../middleware/validationMiddleware'
import HmppsError from '../interfaces/HmppsError'
import { calculateEndDate, formatDate, formatDateISO, isRealDate, parseDate } from '../utils/dateHelpers'
import { bvlsMasteredVlpmFeatureToggleEnabled } from '../utils/featureToggles'

export const AppointmentValidator: Validator = (body: Record<string, string>) => {
  const errors: HmppsError[] = []
  const todayStr = formatDate(formatDateISO(new Date()), 'short')
  let invalidStartTime = false
  let invalidEndTime = false
  let pastDate = false
  const date = parseDate(body.date)
  const emailRegex = /^[a-zA-Z0-9+._%-]{1,256}@[a-zA-Z0-9][a-zA-Z0-9-]{0,64}(\.[a-zA-Z0-9][a-zA-Z0-9-]{0,25})+$/

  if (!body.appointmentType) {
    errors.push({
      text: 'Select the appointment type',
      href: '#appointmentType',
    })
  }

  if (bvlsMasteredVlpmFeatureToggleEnabled() && body.appointmentType === 'VLPM' && !body.probationTeam) {
    errors.push({
      text: 'Select the probation team',
      href: '#probationTeam',
    })
  }

  if (!body.location) {
    errors.push({
      text: 'Select the location',
      href: '#location',
    })
  }

  if (bvlsMasteredVlpmFeatureToggleEnabled() && body.appointmentType === 'VLPM') {
    const hasOfficerDetails = !!(body.officerFullName || body.officerEmail || body.officerTelephone)
    const isUnknownSelected = !!body.officerDetailsNotKnown

    if (!isUnknownSelected && !hasOfficerDetails) {
      errors.push({
        text: "Enter the probation officer's details",
        href: '#officerDetailsOrUnknown',
      })
    } else if (isUnknownSelected === hasOfficerDetails) {
      errors.push({
        text: "Enter either the probation officer's details, or select 'Not yet known'",
        href: '#officerDetailsOrUnknown',
      })
    } else if (!isUnknownSelected) {
      if (!body.officerFullName) {
        errors.push({
          text: "Enter the probation officer's full name",
          href: '#officerFullName',
        })
      }

      if (!body.officerEmail) {
        errors.push({
          text: "Enter the probation officer's email address",
          href: '#officerEmail',
        })
      } else if (!emailRegex.test(body.officerEmail)) {
        errors.push({
          text: "'Enter a valid email address'",
          href: '#officerEmail',
        })
      }

      if (body.officerTelephone && !isValidPhoneNumber(body.officerTelephone, 'GB')) {
        errors.push({
          text: 'Enter a valid UK phone number',
          href: '#officerTelephone',
        })
      }
    }

    if (!body.meetingType) {
      errors.push({
        text: 'Select the meeting type',
        href: '#meetingType',
      })
    }
  }

  if (!body.date) {
    errors.push({
      text: 'Select the date',
      href: '#date',
    })
  }

  if (body.date && !isRealDate(body.date)) {
    errors.push({
      text: `Enter a real date in the format DD/MM/YYYY - for example, ${todayStr}`,
      href: '#date',
    })
  }

  const nightBeforeYearFromNow = subDays(addYears(new Date(), 1), 1).setHours(23, 59, 59, 999)
  if (body.date && isRealDate(body.date) && isAfter(date, nightBeforeYearFromNow)) {
    errors.push({
      text: `Enter a date which is on or before ${formatDate(
        formatDateISO(new Date(nightBeforeYearFromNow)),
        'short',
      )}`,
      href: '#date',
    })
  }

  if (body.date && isRealDate(body.date) && isPast(date.setHours(23, 59, 59))) {
    pastDate = true
    errors.push({
      text: `Enter a date which is not in the past in the format DD/MM/YYYY - for example, ${todayStr}`,
      href: '#date',
    })
  }

  if (!body.startTimeHours && !body.startTimeMinutes) {
    errors.push({
      text: 'Enter the start time',
      href: '#startTime',
    })
  } else {
    if ((body.startTimeHours && parseInt(body.startTimeHours, 10) > 23) || !body.startTimeHours) {
      invalidStartTime = true
      errors.push({
        text: 'Enter an hour which is 23 or less',
        href: '#startTime',
      })
    }

    if ((body.startTimeMinutes && parseInt(body.startTimeMinutes, 10) > 59) || !body.startTimeMinutes) {
      invalidStartTime = true
      errors.push({
        text: 'Enter the minutes using 59 or less',
        href: '#startTime',
      })
    }

    if (body.startTimeHours && isNaN(parseInt(body.startTimeHours, 10))) {
      invalidStartTime = true
      errors.push({
        text: 'Enter an hour using numbers only',
        href: '#startTime',
      })
    }

    if (body.startTimeMinutes && isNaN(parseInt(body.startTimeMinutes, 10))) {
      invalidStartTime = true
      errors.push({
        text: 'Enter the minutes using numbers only',
        href: '#startTime',
      })
    }

    if (!pastDate && !invalidStartTime && body.startTimeHours && body.startTimeMinutes) {
      const dateTime = body.date && date.setHours(+body.startTimeHours, +body.startTimeMinutes, 0)
      if (dateTime && dateTime < new Date().getTime()) {
        invalidStartTime = true
        errors.push({
          text: 'Enter a start time which is not in the past',
          href: '#startTime',
        })
      }
    }
  }

  if (!body.endTimeHours && !body.endTimeMinutes) {
    errors.push({
      text: 'Enter the end time',
      href: '#endTime',
    })
  } else {
    if ((body.endTimeHours && parseInt(body.endTimeHours, 10) > 23) || !body.endTimeHours) {
      invalidEndTime = true
      errors.push({
        text: 'Enter an hour which is 23 or less',
        href: '#endTime',
      })
    }

    if ((body.endTimeMinutes && parseInt(body.endTimeMinutes, 10) > 59) || !body.endTimeMinutes) {
      invalidEndTime = true
      errors.push({
        text: 'Enter the minutes using 59 or less',
        href: '#endTime',
      })
    }

    if (body.endTimeHours && isNaN(parseInt(body.endTimeHours, 10))) {
      invalidEndTime = true
      errors.push({
        text: 'Enter an hour using numbers only',
        href: '#endTime',
      })
    }

    if (body.endTimeMinutes && isNaN(parseInt(body.endTimeMinutes, 10))) {
      invalidEndTime = true
      errors.push({
        text: 'Enter the minutes using numbers only',
        href: '#endTime',
      })
    }

    if (!pastDate && !invalidEndTime && body.endTimeHours && body.endTimeMinutes) {
      const dateTime = body.date && date.setHours(+body.endTimeHours, +body.endTimeMinutes, 0)
      if (dateTime && dateTime < new Date().getTime()) {
        invalidEndTime = true
        errors.push({
          text: 'Enter an end time which is not in the past',
          href: '#endTime',
        })
      }
    }
  }

  if (
    !invalidStartTime &&
    !invalidEndTime &&
    isBefore(
      date.setHours(+body.endTimeHours, +body.endTimeMinutes, 0),
      date.setHours(+body.startTimeHours, +body.startTimeMinutes, 0),
    )
  ) {
    errors.push({
      text: 'The end time must be after the start time',
      href: '#endTime',
    })
  }

  if (!body.recurring && body.appointmentType !== 'VLB' && body.appointmentType !== 'VLPM') {
    errors.push({
      text: 'Select if this is a recurring appointment or not',
      href: '#recurring',
    })
  }

  if (body.recurring === 'yes') {
    if (!body.repeats) {
      errors.push({
        text: 'Select the repeat period for this appointment',
        href: '#repeats',
      })
    }

    if (!body.times || isNaN(parseInt(body.times, 10))) {
      errors.push({
        text: 'Enter the number of appointments using numbers only',
        href: '#times',
      })
    }

    if (body.date && body.repeats && body.times && !isNaN(parseInt(body.times, 10))) {
      const lastAppointmentDate = calculateEndDate(date, body.repeats, +body.times)
      const startDate = date

      if (!isBefore(lastAppointmentDate, addYears(startDate, 1).setHours(0, 0, 0))) {
        errors.push({
          href: '#times',
          text: 'Select fewer number of appointments - you can only add them for a maximum of 1 year',
        })
      }
    }

    if (body.repeats === 'WEEKDAYS' && body.date && isWeekend(date)) {
      errors.push({
        href: '#repeats',
        text: 'This weekend appointment cannot be repeated on a weekday (Monday to Friday). Select to repeat it daily, weekly, fortnightly or monthly',
      })
    }
  }

  if (body.comments && body.comments.length > 3600) {
    errors.push({
      text: 'Enter comments using 3,600 characters or less',
      href: '#comments',
    })
  }

  return errors
}
