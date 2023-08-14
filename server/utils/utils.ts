import { ScheduleItem } from '../data/overviewPage'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { PagedList, PagedListQueryParams } from '../interfaces/prisonApi/pagedList'
import { SortOption } from '../interfaces/sortSelector'
import { Address } from '../interfaces/address'
import { HmppsError } from '../interfaces/hmppsError'
import { ListMetadata } from '../interfaces/listMetadata'
import { CaseLoad } from '../interfaces/caseLoad'
import { Prisoner } from '../interfaces/prisoner'
import { User } from '../data/hmppsAuthClient'
import { Role } from '../data/enums/role'
import config from '../config'

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
  // this check is for the autherror page
  if (!fullName) return null

  const array = fullName.split(' ')
  return `${array[0][0]}. ${array.reverse()[0]}`
}

/**
 * Converts a ScheduleItem into a string displaying the time in the format
 * StartTime to EndTime
 */
export const formatScheduleItem = (scheduleItem: ScheduleItem): string => {
  if (scheduleItem.startTime) {
    const times = [scheduleItem.startTime]
    if (scheduleItem.endTime) times.push(scheduleItem.endTime)
    return times.join(' to ')
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
  } else if (options?.style === NameFormatStyle.firstLast) {
    names.splice(1, 1)
  }
  return names
    .filter(s => s)
    .map(s => s.toLowerCase())
    .join(' ')
    .replace(/(^\w)|([\s'-]+\w)/g, letter => letter.toUpperCase())
}

/**
 * Convert name in 'Last, First' format to 'First Last'
 *
 * @param name
 */
export const convertNameCommaToHuman = (name: string): string => {
  if (!name) return ''

  return name.split(', ').reverse().join(' ')
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

  let pages = []

  if (pagedList?.totalPages > 1 && pagedList?.totalPages < 8) {
    pages = [...Array(pagedList.totalPages).keys()].map(page => {
      return {
        text: `${page + 1}`,
        href: [`?page=${page + 1}`, query].filter(Boolean).join('&'),
        selected: currentPage === page + 1,
      }
    })
  } else if (pagedList?.totalPages > 7) {
    pages.push({
      text: '1',
      href: [`?page=1`, query].filter(Boolean).join('&'),
      selected: currentPage === 1,
    })

    const pageRange = [currentPage - 1, currentPage, currentPage + 1]
    let preDots = false
    let postDots = false
    // eslint-disable-next-line no-plusplus
    for (let i = 2; i < pagedList.totalPages; i++) {
      if (pageRange.includes(i)) {
        pages.push({
          text: `${i}`,
          href: [`?page=${i}`, query].filter(Boolean).join('&'),
          selected: currentPage === i,
        })
      } else if (i < pageRange[0] && !preDots) {
        pages.push({
          text: '...',
          type: 'dots',
        })
        preDots = true
      } else if (i > pageRange[2] && !postDots) {
        pages.push({
          text: '...',
          type: 'dots',
        })
        postDots = true
      }
    }

    pages.push({
      text: `${pagedList.totalPages}`,
      href: [`?page=${pagedList.totalPages}`, query].filter(Boolean).join('&'),
      selected: currentPage === pagedList.totalPages,
    })
  }

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

  const viewAllUrl = [`?${mapToQueryString(queryParams)}`, 'showAll=true'].filter(Boolean).join('&')

  return <ListMetadata>{
    filtering: {
      ...queryParams,
      queryParams: { sort: queryParams.sort },
    },
    sorting: {
      id: 'sort',
      label: sortLabel,
      options: sortOptions,
      sort: queryParams.sort,
      queryParams: {
        ...queryParams,
      },
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
      viewAllUrl,
    },
  }
}

export const formatCurrency = (number: number, currency: string): string =>
  typeof number === 'number' ? number.toLocaleString('en-GB', { style: 'currency', currency: currency || 'GBP' }) : ''

export const addressToLines = ({ flat, premise, street, town, county, postalCode, country }: Address): string[] => {
  let lineOne = [premise, street].filter(s => s).join(', ')
  if (flat) {
    lineOne = `Flat ${flat}, ${lineOne}`
  }
  return [lineOne, town, county, postalCode, country].filter(s => s)
}

/**
 * Find error related to given form field and return error message
 *
 * Allows `govukInput` (etc) form input components to render an error message on the form field by using the `errorMessage` param,
 *
 * e.g. `errorMessage: errors | findError('from')`
 *
 * @param errors
 * @param formFieldId
 */
export const findError = (errors: HmppsError[], formFieldId: string) => {
  if (!errors) return null
  const item = errors.find((error: HmppsError) => error.href === `#${formFieldId}`)
  if (item) {
    return {
      text: item.text,
    }
  }
  return null
}

/**
 * Whether or not the prisoner belongs to any of the users case loads
 *
 * @param prisonerAgencyId
 * @param userCaseLoads
 */
export const prisonerBelongsToUsersCaseLoad = (prisonerAgencyId: string, userCaseLoads: CaseLoad[]): boolean => {
  return userCaseLoads.some(caseLoad => caseLoad.caseLoadId === prisonerAgencyId)
}

/**
 * Whether any of the roles exist for the given user allowing for conditional role based access on any number of roles
 *
 * @param rolesToCheck
 * @param userRoles
 */
export const userHasRoles = (rolesToCheck: string[], userRoles: string[]): boolean => {
  const normaliseRoleText = (role: string): string => role.replace(/ROLE_/, '')
  return rolesToCheck.map(normaliseRoleText).some(role => userRoles.map(normaliseRoleText).includes(role))
}

/**
 * Whether all of the roles exist for the given user allowing for conditional role based access on any number of roles
 *
 * @param rolesToCheck
 * @param userRoles
 */
export const userHasAllRoles = (rolesToCheck: string[], userRoles: string[]): boolean => {
  return rolesToCheck.every(role => userRoles.includes(role))
}

/**
 * Enable the `userCanEdit` flag based on user roles/flags and prisoner location/flags
 *
 * @param user
 * @param prisoner
 */
export const userCanEdit = (user: User, prisoner: Partial<Prisoner>): boolean => {
  return (
    user.caseLoads?.some(caseload => caseload.caseLoadId === prisoner.prisonId) ||
    (['OUT', 'TRN'].includes(prisoner.prisonId) && userHasRoles([Role.InactiveBookings], user.userRoles)) ||
    (prisoner.restrictedPatient && userHasRoles([Role.PomUser], user.userRoles))
  )
}

export const prisonerIsOut = (prisonId: string): boolean => {
  return ['OUT'].includes(prisonId)
}

export const prisonerIsTRN = (prisonId: string): boolean => {
  return ['TRN'].includes(prisonId)
}

export const apostrophe = (word: string): string => {
  const lastCh = word.charAt(word.length - 1)
  if (lastCh === 's') {
    return `${word}’`
  }
  return `${word}’s`
}

export const prependBaseUrl = (url: string): string => {
  const urlWithBaseUrl = `${config.serviceUrls.digitalPrison}${url}`
  return urlWithBaseUrl
}

export const prependHmppsAuthBaseUrl = (url: string): string => {
  const urlWithHmppsAuthBaseUrl = `${config.apis.hmppsAuth.url}${url}`
  return urlWithHmppsAuthBaseUrl
}

/**
 * Returns a description for specific category codes, otherwise just the code.
 *
 * Returns 'Not entered' of the code is undefined
 *
 * @param code
 */
export const formatCategoryCodeDescription = (code: string): string => {
  switch (code) {
    case null:
    case undefined:
      return 'Not entered'
    case 'U':
      return 'Unsentenced'
    case 'P':
      return 'A (provisional)'
    case 'H':
      return 'A High'
    default:
      return code
  }
}

// eslint-disable-next-line no-shadow
export enum SortType {
  ASC = 'ASC',
  DESC = 'DESC',
}

export const sortArrayOfObjectsByDate = (arrayOfObjects: object[], dateKey: string, sortType: SortType): object[] => {
  // eslint-disable-next-line
  let array = arrayOfObjects.sort(function (a, b) {
    const dateA = new Date(a[dateKey]).getTime()
    const dateB = new Date(b[dateKey]).getTime()
    if (sortType === SortType.DESC) {
      return dateA < dateB ? 1 : -1
    }
    if (sortType === SortType.ASC) {
      return dateA < dateB ? -1 : 1
    }
    return 0
  })
  return array
}
