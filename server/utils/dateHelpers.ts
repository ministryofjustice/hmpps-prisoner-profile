import {
  add,
  addBusinessDays,
  addDays,
  addMonths,
  addWeeks,
  differenceInDays,
  differenceInMonths,
  differenceInYears,
  format,
  formatISO,
  isValid,
  parse,
} from 'date-fns'
import logger from '../../logger'
import { pluralise } from './pluralise'

/**
 * Format a Date object as an ISO-8601 string, rendering only the date part.
 *
 * e.g. 31/01/2023 -> 2023-01-31
 *
 * @param date
 */
export const formatDateISO = (date: Date): string => {
  let dateStr
  try {
    dateStr = formatISO(date, { representation: 'date' })
  } catch (error) {
    logger.error(`Error: formatDateISO - ${error.message}`)
  }
  return dateStr
}

/**
 * Format a Date object as an ISO-8601 string, optionally setting the time to 00:00 or 23:59
 *
 * @param date
 * @param options
 */
export const formatDateTimeISO = (date: Date, options?: { startOfDay?: boolean; endOfDay?: boolean }): string => {
  let dateStr
  const adjustedDate = date
  if (options?.startOfDay) {
    adjustedDate.setHours(0)
    adjustedDate.setMinutes(0)
    adjustedDate.setSeconds(0)
  } else if (options?.endOfDay) {
    adjustedDate.setHours(23)
    adjustedDate.setMinutes(59)
    adjustedDate.setSeconds(59)
  }
  try {
    dateStr = format(adjustedDate, "yyyy-MM-dd'T'HH:mm:ss")
  } catch (error) {
    logger.error(`Error: formatDateTimeISO - ${error.message}`)
  }
  return dateStr
}

/**
 * Parse date string to a Date object
 *
 * Valid date strings are in day/month/year format, with either 1 or 2 digits for day and month, and 4 digits for year
 *
 * Separator can be any of `-/,. `
 *
 * @param date
 */
export const parseDate = (date: string): Date => {
  const dateFormatPattern = /(\d{1,2})([-/,. ])(\d{1,2})[-/,. ](\d{4})/

  if (!isRealDate(date)) return new Date(NaN)

  const separator = date.match(dateFormatPattern)[2]
  return parse(date, `dd${separator}MM${separator}yyyy`, new Date())
}

/**
 * Return true is date string is a real date
 *
 * Checks if format is valid *and* the date is valid (e.g. not 30th February)
 *
 * @param date
 */
export const isRealDate = (date: string): boolean => {
  const dateFormatPattern = /(\d{1,2})([-/,. ])(\d{1,2})[-/,. ](\d{4})/

  if (!dateFormatPattern.test(date)) return false
  const separator = date.match(dateFormatPattern)[2]
  return isValid(parse(date, `dd${separator}MM${separator}yyyy`, new Date()))
}

/**
 * Formats an ISO-8601 date string to standard gov.uk display format, e.g. 20 January 2023
 *
 * Also supports passing in an optional style string to output other standard formats:
 * short, full and medium - e.g. '20/01/2023', 'Friday 20 January 2023' and '20 Jan 2023'
 *
 * Note, that we additionally remove commas from the 'full' format.
 *
 * @param isoDate ISO-8601 format date string
 * @param style formatting style to use - long (default), short, full, medium
 * @returns formatted date string
 */
export const formatDate = (isoDate: string, style: 'short' | 'full' | 'long' | 'medium' = 'long'): string => {
  if (!isoDate) return ''

  return new Date(isoDate).toLocaleDateString('en-gb', { dateStyle: style })?.replaceAll(',', '')
}

/**
 * Formats an ISO-8601 datetime string to a human readable string, e.g. 20 January 2023 at 16:27
 *
 * Also supports passing in an optional style string to output other standard formats:
 * short, full and medium - e.g. '20/01/2023 16:27', 'Friday 20 January 2023 at 16:27' and '20 Jan 2023 at 16:27'
 *
 * Note, that we additionally remove commas from the 'full' format.
 *
 * @param isoDate ISO-8601 format date string
 * @param style formatting style to use - long (default), short, full, medium
 * @param separator separator between date and time - default ' ' for short or ' at ' for others
 * @returns formatted datetime string
 */
export const formatDateTime = (
  isoDate: string,
  style: 'short' | 'full' | 'long' | 'medium' = 'long',
  separator: string = undefined,
): string => {
  if (!isoDate) return ''

  let datetimeStr = formatDate(isoDate, style)
  if (!separator) {
    if (style === 'short') {
      datetimeStr += ' '
    } else {
      datetimeStr += ' at '
    }
  } else {
    datetimeStr += separator
  }
  datetimeStr += new Date(isoDate).toLocaleTimeString('en-gb', { hour: '2-digit', minute: '2-digit' })
  return datetimeStr
}

export const timeFormat = (dateTimeStr: string) => {
  return new Date(dateTimeStr).toLocaleTimeString('en-gb', { hour: '2-digit', minute: '2-digit' })
}

export const dateToIsoDate = (date: string) => {
  return formatDateISO(parseDate(date))
}

export const formatDateWithTime = (date: string, hours: string, minutes: string) => {
  return `${date}T${hours}:${minutes}`
}

export const calculateEndDate = (startDate: Date, repeatPeriod: string, times: number): Date => {
  const adjustedTimes = times - 1 // Appointments include the initial one

  if (adjustedTimes < 1) {
    return startDate
  }

  switch (repeatPeriod) {
    case 'DAILY':
      return addDays(startDate, adjustedTimes)
    case 'WEEKDAYS':
      return addBusinessDays(startDate, adjustedTimes)
    case 'WEEKLY':
      return addWeeks(startDate, adjustedTimes)
    case 'FORTNIGHTLY':
      return add(startDate, { weeks: adjustedTimes * 2 })
    case 'MONTHLY':
      return addMonths(startDate, adjustedTimes)
    default:
      return null
  }
}

/**
 * Formats the date of birth into an age string
 * Return 'date of birth not entered' if none is given
 * @param dateOfBirth date of birth in the format yyyy-MM-dd
 * @returns age with correct number of days and months
 */
export const ageAsString = (dateOfBirth?: string): string => {
  if (!dateOfBirth) return 'date of birth not entered'

  const ageInYears = differenceInYears(new Date(), new Date(dateOfBirth))

  if (ageInYears === 0) {
    const parsedDate = new Date(dateOfBirth)
    const months = differenceInMonths(new Date(), parsedDate)

    if (months === 0) {
      const days = differenceInDays(new Date(), parsedDate)
      return `${pluralise(days, 'day')} old`
    }

    return `${pluralise(months, 'month')} old`
  }
  return `${pluralise(ageInYears, 'year')} old`
}

/**
 * Formats an ISO-8601 date string as month and year for addresses, e.g. January 2023
 *
 * @param isoDate ISO-8601 format date string
 * @returns formatted date string
 */
export const formatAddressDate = (isoDate: string): string => {
  if (!isoDate) return ''

  return format(isoDate, 'MMMM yyyy')
}

export const formatDateToPattern = (isoDate: string, pattern: string): string => {
  if (!isoDate) return ''

  return format(isoDate, pattern)
}
