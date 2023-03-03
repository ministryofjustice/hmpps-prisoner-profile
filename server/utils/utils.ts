import { ScheduleItem } from '../data/overviewPage'

const properCase = (word: string): string =>
  word.length >= 1 ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word

const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

/**
 * Converts a name (first name, last name, middle name, etc.) to proper case equivalent, handling double-barreled names
 * correctly (i.e. each part in a double-barreled is converted to proper case).
 * @param name name to be converted.
 * @returns name converted to proper case.
 */
export const properCaseName = (name: string): string => (isBlank(name) ? '' : name.split('-').map(properCase).join('-'))

export const convertToTitleCase = (sentence: string): string =>
  isBlank(sentence) ? '' : sentence.split(' ').map(properCaseName).join(' ')

export const initialiseName = (fullName?: string): string | null => {
  // this check is for the authError page
  if (!fullName) return null

  const array = fullName.split(' ')
  return `${array[0][0]}. ${array.reverse()[0]}`
}

/**
 * Formats an ISO-8601 date string to standard gov.uk display format, e.g. 20 January 2023
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
 * Converts a ScheduleItem into a string displaying the time in the format
 * StartTime to EndTime
 */
export const formatScheduleItem = (scheduleItem: ScheduleItem): string => {
  if (scheduleItem.startTime && scheduleItem.endTime) {
    return `${scheduleItem.startTime} to ${scheduleItem.endTime}`
  }
  return ''
}

/**
 * Converts the personal details to the rows for a summary list component
 */
export type SummaryListRowItem = {
  text?: string
  html?: string
  classes?: string
}

export type SummaryListRow = {
  key: SummaryListRowItem
  value: SummaryListRowItem
}

export const summaryListOneHalfWidth = (rows: SummaryListRow[]) => {
  return rows.map((row: SummaryListRow) => {
    const { key, value } = row
    key.classes = 'govuk-!-width-one-half'
    value.classes = 'govuk-!-width-one-half'
    return { key, value }
  })
}

/**
 * Format a numeric value stored in decimal number format into a decimal string with currency symbol.
 *
 * @param val
 * @param emptyState - defaults to '0.00'
 * @param currencySymbol - defaults to '£'
 */
export const formatMoney = (val: number, emptyState: string = undefined, currencySymbol = '£'): string => {
  if (!val && emptyState) return emptyState

  return `${currencySymbol}${val?.toFixed(2) || '0.00'}`
}

/**
 * Format a number of privileged visits into a summary string.
 *
 * @param count
 */
export const formatPrivilegedVisitsSummary = (count: number): string => {
  return `Including ${count} privileged visits`
}

export const arrayToQueryString = (array: string[] | number[] | boolean[], key: string): string =>
  array && array.map(item => `${key}=${encodeURIComponent(item)}`).join('&')

export const mapToQueryString = (params: Record<never, never>): string =>
  Object.keys(params)
    .filter(key => params[key])
    .map(key => {
      if (Array.isArray(params[key])) return arrayToQueryString(params[key], key)
      return `${key}=${encodeURIComponent(params[key])}`
    })
    .join('&')

export const getNamesFromString = (string: string): string[] =>
  string &&
  string
    .split(', ')
    .reverse()
    .join(' ')
    .split(' ')
    .map(name => properCaseName(name))

export const toFullName = ({
  firstName,
  middleNames,
  lastName,
}: {
  firstName: string
  middleNames?: string
  lastName: string
}): string =>
  [firstName, middleNames, lastName]
    .map(s => s && s.trim())
    .filter(s => s)
    .join(' ')
