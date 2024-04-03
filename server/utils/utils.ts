import { differenceInMonths, parse } from 'date-fns'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import PagedList, { PagedListItem, PagedListQueryParams } from '../data/interfaces/prisonApi/PagedList'
import { SortOption } from '../interfaces/SortParams'
import Address from '../services/interfaces/personalPageService/Address'
import HmppsError from '../interfaces/HmppsError'
import ListMetadata from '../interfaces/ListMetadata'
import CaseLoad from '../data/interfaces/prisonApi/CaseLoad'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { User } from '../data/hmppsAuthClient'
import { Role } from '../data/enums/role'
import config from '../config'
import { type OverviewNonAssociation } from '../services/interfaces/overviewPageService/OverviewPage'
import ScheduledEvent from '../data/interfaces/prisonApi/ScheduledEvent'
import ReferenceCode from '../data/interfaces/prisonApi/ReferenceCode'
import CommunityManager from '../data/interfaces/deliusApi/CommunityManager'

const properCase = (word: string): string =>
  word.length >= 1 ? word[0].toUpperCase() + word.toLowerCase().slice(1) : word

const isBlank = (str: string): boolean => !str || /^\s*$/.test(str)

export const isEmpty = (array: Array<unknown>): boolean => !array || (Array.isArray(array) && !array.length)

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
export const formatScheduleItem = (scheduleItem: ScheduledEvent): string => {
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
 * Format a numeric value into a decimal string with currency symbol.
 *
 * Set `usePence` to `true` if the value being formatted is in pence.
 *
 * @param val
 * @param emptyState - defaults to '0.00'
 * @param currency - defaults to 'GBP'
 * @param usePence - defaults to false
 */
export const formatMoney = (
  val: number,
  { emptyState = undefined, currency = 'GBP', usePence = false } = {},
): string => {
  if (!val && emptyState) return emptyState

  return ((val || 0) / (usePence ? 100 : 1)).toLocaleString('en-GB', { style: 'currency', currency })
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

export const mapToQueryString = (params: Record<never, never>): string => {
  if (!params) return ''
  return Object.keys(params)
    .filter(key => params[key])
    .map(key => {
      if (Array.isArray(params[key])) return arrayToQueryString(params[key], key)
      return `${key}=${encodeURIComponent(params[key])}`
    })
    .join('&')
}

export const getNamesFromString = (string: string): string[] =>
  string &&
  string
    .split(', ')
    .reverse()
    .join(' ')
    .split(' ')
    .map(name => properCaseName(name))

export const calculateAge = (dob: string): { years: number; months: number } => {
  const currentDate = new Date()

  const birthDate = parse(dob, 'yyyy-MM-dd', new Date())

  const totalMonths = differenceInMonths(currentDate, birthDate)

  const years = Math.floor(totalMonths / 12)
  const months = totalMonths % 12

  return { years, months }
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
 * Format part of a person's name - i.e. firstname, or surname, etc
 *
 * @param name
 */
export const formatNamePart = (name: string): string => {
  return name.toLowerCase().replace(/(^\w)|([\s'-]+\w)/g, letter => letter.toUpperCase())
}

/**
 * Convert name in 'Last, First' format to 'First Last'
 *
 * @param name
 */
export const convertNameCommaToHuman = (name: string): string => {
  if (!name) return ''

  return name
    .split(', ')
    .reverse()
    .map(namePart => formatNamePart(namePart))
    .join(' ')
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
export const generateListMetadata = <T extends PagedListQueryParams>(
  pagedList: PagedList<PagedListItem>,
  queryParams: T,
  itemDescription: string,
  sortOptions?: SortOption[],
  sortLabel?: string,
  enableShowAll?: boolean,
): ListMetadata<T> => {
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

  return <ListMetadata<T>>{
    filtering: {
      ...queryParams,
      queryParams: { sort: queryParams.sort },
    },
    sorting:
      sortOptions && sortLabel
        ? {
            id: 'sort',
            label: sortLabel,
            options: sortOptions,
            sort: queryParams.sort,
            queryParams: {
              ...queryParams,
              sort: undefined,
            },
          }
        : null,
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
      enableShowAll: enableShowAll === undefined ? false : enableShowAll,
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
  const addressArray = [lineOne, town, county, postalCode, country].filter(s => s)
  if (addressArray.length !== 1 || !country) return addressArray
  return []
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
  return `${config.serviceUrls.digitalPrison}${url}`
}

export const prependHmppsAuthBaseUrl = (url: string): string => {
  return `${config.apis.hmppsAuth.url}${url}`
}

/**
 * Returns a description for specific category codes, otherwise just the code.
 *
 * Returns 'Not entered' of the code is undefined
 *
 * @param code
 * @param categoryText
 */
export const formatCategoryCodeDescription = (code: string, categoryText: string): string => {
  if (['A', 'B', 'C', 'D'].includes(code)) {
    return code
  }
  switch (code) {
    case null:
    case undefined:
      return 'Not entered'
    case 'U':
      return 'Unsentenced'
    case 'P':
      return 'A – provisional'
    case 'H':
      return 'A – high'
    default:
      return categoryText
  }
}

/**
 * Returns a label for use in the cat a prisoner tag.
 *
 * @param code
 */
export const formatCategoryALabel = (code: string): string => {
  switch (code) {
    case 'A':
      return 'Cat A'
    case 'P':
      return 'Cat A Provisional'
    case 'H':
      return 'Cat A High'
    case 'Q':
      return 'Female Restricted'
    case 'V':
      return 'YOI Restricted'
    default:
      return undefined
  }
}

// eslint-disable-next-line no-shadow
export enum SortType {
  ASC = 'ASC',
  DESC = 'DESC',
}

export const sortArrayOfObjectsByDate = <T>(arrayOfObjects: T[], dateKey: string, sortType: SortType): T[] => {
  return arrayOfObjects.sort((a, b) => {
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
}

export const neurodiversityEnabled = (agencyId: string): boolean => {
  return config.featureToggles.neurodiversityEnabledPrisons?.includes(agencyId)
}

export const stripAgencyPrefix = (location: string, agency: string): string => {
  const parts = location && location.split('-')
  if (parts && parts.length > 0) {
    const index = parts.findIndex(p => p === agency)
    if (index >= 0) {
      return location.substring(parts[index].length + 1, location.length)
    }
  }

  return null
}

export const formatLocation = (locationName: string): string => {
  if (!locationName) return undefined
  if (locationName.includes('RECP')) return 'Reception'
  if (locationName.includes('CSWAP')) return 'No cell allocated'
  if (locationName.includes('COURT')) return 'Court'
  return locationName
}

export const isTemporaryLocation = (locationName: string): boolean => {
  if (!locationName) return false
  return (
    locationName.endsWith('RECP') ||
    locationName.endsWith('CSWAP') ||
    locationName.endsWith('COURT') ||
    locationName.endsWith('TAP')
  )
}

export const extractLocation = (location: string, agencyId: string): string => {
  if (!location || !agencyId) return undefined
  const withoutAgency = stripAgencyPrefix(location, agencyId)
  return formatLocation(withoutAgency)
}

export const groupBy = <T>(array: T[], key: string): Record<string, T[]> =>
  array &&
  array.length &&
  array.reduce((acc, currentItem) => {
    const groupKey = currentItem[key]
    const existingGroupedItems = acc[groupKey] || []

    return { ...acc, [groupKey]: [...existingGroupedItems, currentItem] }
  }, {})

export const times =
  (number: number) =>
  (func: (index: unknown) => unknown): void => {
    const iter = (index: number) => {
      if (index === number) return
      func(index)
      iter(index + 1)
    }
    return iter(0)
  }

export const hasLength = (array: unknown[]): boolean => array && array.length > 0

type NonAssociationTableRow = [{ html: string }, { text: string }, { text: string }, { text: string }]
export const toNonAssociationRows = (nonAssociations: OverviewNonAssociation[]): NonAssociationTableRow[] =>
  nonAssociations.map(na => [
    {
      html: `<a class="govuk-link govuk-link--no-visited-state" href="/prisoner/${na.offenderNo}">${na.nonAssociationName}</a>`,
    },
    { text: na.offenderNo },
    { text: na.assignedLivingUnitDescription },
    { text: na.reasonDescription },
  ])

export const sortByDateTime = (t1: string, t2: string): number => {
  const [date1, date2] = [new Date(t1).getTime(), new Date(t2).getTime()]
  return date1 - date2
}

export interface SelectOption {
  text: string
  value: string | number
  selected?: boolean
  attributes?: {
    hidden?: 'hidden'
  }
}
export const refDataToSelectOptions = (refData: ReferenceCode[]): SelectOption[] => {
  return refData.map(r => ({
    text: r.description,
    value: r.code,
  }))
}

export const objectToSelectOptions = (array: object[], id: string, description: string): SelectOption[] => {
  return array.map(obj => ({
    text: obj[description],
    value: obj[id],
  }))
}

export const formatCommunityManager = (communityManager: CommunityManager): string => {
  if (communityManager === null) return 'Not assigned' // Delius has returned 404 because it cannot find the prisoner
  if (communityManager === undefined) return 'We cannot show these details right now' // Delius has returned an error, e.g. timeout
  if (communityManager.unallocated) return `${communityManager.team.description} (COM not yet allocated)`

  return formatName(communityManager.name.forename, null, communityManager.name.surname)
}

export const putLastNameFirst = (firstName: string, lastName: string): string => {
  if (!firstName && !lastName) return null
  if (!firstName && lastName) return properCaseName(lastName)
  if (firstName && !lastName) return properCaseName(firstName)

  return `${properCaseName(lastName)}, ${properCaseName(firstName)}`
}

export const apiErrorMessage = 'We cannot show these details right now. Try again later.'

export const compareStrings = (l: string, r: string): number => l.localeCompare(r, 'en', { ignorePunctuation: true })
