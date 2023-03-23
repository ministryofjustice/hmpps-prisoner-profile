import { ScheduleItem } from '../data/overviewPage'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { PagedList, PagedListQueryParams } from '../interfaces/prisonApi/pagedList'
import { ListMetadata } from '../interfaces/pages/alertsPageData'
import { SortOption } from '../interfaces/sortSelector'
import { Address } from '../interfaces/address'

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

export const yearsBetweenDateStrings = (start: string, end: string): number => {
  const endDate = new Date(end)
  const startDate = new Date(start)
  const endMonth = endDate.getMonth()
  const startMonth = startDate.getMonth()
  let years: number = endDate.getFullYear() - startDate.getFullYear()

  if (years === 0) {
    return years
  }

  if (startMonth > endMonth) {
    years -= 1
  } else if (startMonth === endMonth) {
    if (startDate.getDate() > endDate.getDate()) {
      years -= 1
    }
  }

  return years
}

/**
 * Format a person's name with proper capitalisation
 *
 * Correctly handles names with apostrophes, hyphens and spaces
 *
 * Examples, "James O'Reilly", "Jane Smith-Doe", "Robert Henry Jones"
 *
 * @param firstName - first name
 * @param middleNames - middle names as space separated list
 * @param lastName - last name
 * @param options
 * @param options.style - format to use for output name, e.g. `NameStyleFormat.lastCommaFirst`
 * @returns formatted name string
 */
export const formatName = (
  firstName: string,
  middleNames: string,
  lastName: string,
  options?: { style: NameFormatStyle },
): string => {
  const names = [firstName, middleNames, lastName]
  if (options?.style === NameFormatStyle.lastCommaFirstMiddle) {
    names.unshift(`${names.pop()},`)
  } else if (options?.style === NameFormatStyle.lastCommaFirst) {
    names.unshift(`${names.pop()},`)
    names.pop() // Remove middleNames
  }
  return names
    .filter(s => s)
    .map(s => s.toLowerCase())
    .join(' ')
    .replace(/(^\w)|([\s'-]+\w)/g, letter => letter.toUpperCase())
}

/**
 * Generate metadata for list pages, including pagination, sorting, filtering
 *
 * For the current page and pages array, the value is incremented by 1 as the API uses a zero based array
 * but users expect page numbers in url, etc to be one based.
 *
 * @param pagedList
 * @param queryParams
 * @param itemDescription
 * @param sortOptions
 * @param sortLabel
 */
export const generateListMetadata = (
  pagedList: PagedList,
  queryParams: PagedListQueryParams,
  itemDescription: string,
  sortOptions: SortOption[],
  sortLabel: string,
): ListMetadata => {
  const query = mapToQueryString(queryParams)
  const currentPage = pagedList?.pageable ? pagedList.pageable.pageNumber + 1 : undefined

  const pages =
    pagedList?.totalPages > 1
      ? [...Array(pagedList.totalPages).keys()].map(page => {
          return {
            text: `${page + 1}`,
            href: [`?page=${page + 1}`, query].filter(Boolean).join('&'),
            selected: currentPage === page + 1,
          }
        })
      : []

  const next = pagedList?.last
    ? undefined
    : {
        href: [`?page=${currentPage + 1}`, query].filter(Boolean).join('&'),
        text: 'Next',
      }

  const previous = pagedList?.first
    ? undefined
    : {
        href: [`?page=${currentPage - 1}`, query].filter(Boolean).join('&'),
        text: 'Previous',
      }

  return <ListMetadata>{
    sorting: {
      id: 'sort',
      label: sortLabel,
      options: sortOptions,
      sort: queryParams.sort,
    },
    pagination: {
      itemDescription,
      previous,
      next,
      page: currentPage,
      offset: pagedList?.pageable?.offset,
      pageSize: pagedList?.size,
      totalPages: pagedList?.totalPages,
      totalElements: pagedList?.totalElements,
      elementsOnPage: pagedList?.numberOfElements,
      pages,
    },
  }
}

export const addressToLines = ({ flat, premise, street, town, postalCode, country }: Address): string[] => {
  let lineOne = [premise, street].filter(s => s).join(', ')
  if (flat) {
    lineOne = `Flat ${flat}, ${lineOne}`
  }
  return [lineOne, town, postalCode, country].filter(s => s)
}
