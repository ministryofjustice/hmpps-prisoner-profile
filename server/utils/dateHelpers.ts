import { formatISO, isValid, parse } from 'date-fns'
import logger from '../../logger'

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
    adjustedDate.setMilliseconds(0)
  } else if (options?.endOfDay) {
    adjustedDate.setHours(23)
    adjustedDate.setMinutes(59)
    adjustedDate.setSeconds(59)
    adjustedDate.setMilliseconds(999)
  }
  try {
    dateStr = formatISO(adjustedDate, { representation: 'complete' })
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
 * short, full and medium - e.g. '20/01/2023', 'Friday, 20 January 2023' and '20 Jan 2023'
 *
 * @param isoDate ISO-8601 format date string
 * @param style formatting style to use - long (default), short, full, medium
 * @returns formatted date string
 */
export const formatDate = (isoDate: string, style: 'short' | 'full' | 'long' | 'medium' = 'long'): string => {
  if (!isoDate) return ''

  return new Date(isoDate).toLocaleDateString('en-gb', { dateStyle: style })
}

/**
 * Formats an ISO-8601 datetime string to a human readable string, e.g. 20 January 2023 at 16:27
 *
 * Also supports passing in an optional style string to output other standard formats:
 * short, full and medium - e.g. '20/01/2023 16:27', 'Friday, 20 January 2023 at 16:27' and '20 Jan 2023 at 16:27'
 *
 * @param isoDate ISO-8601 format date string
 * @param style formatting style to use - long (default), short, full, medium
 * @returns formatted datetime string
 */
export const formatDateTime = (isoDate: string, style: 'short' | 'full' | 'long' | 'medium' = 'long'): string => {
  if (!isoDate) return ''

  let datetimeStr = new Date(isoDate).toLocaleDateString('en-gb', { dateStyle: style })
  if (style === 'short') {
    datetimeStr += ' '
  } else {
    datetimeStr += ' at '
  }
  datetimeStr += new Date(isoDate).toLocaleTimeString('en-gb', { hour: '2-digit', minute: '2-digit' })
  return datetimeStr
}
