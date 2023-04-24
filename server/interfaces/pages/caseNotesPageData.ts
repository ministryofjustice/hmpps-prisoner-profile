import { PagedList } from '../prisonApi/pagedList'
import { SortParams } from '../sortSelector'
import { HmppsError } from '../hmppsError'

export interface CaseNotesPageData {
  pagedCaseNotes: PagedList // TODO move out of prisonApi
  listMetadata: CaseNotesListMetadata
  types: { value: string; text: string }[]
  subTypes: { value: string; text: string }[]
  typeSubTypeMap: { [key: string]: { value: string; text: string }[] }
  fullName: string
  errors: HmppsError[]
}

export interface CaseNotesListMetadata {
  // TODO extend generic ListMetadata interface??? just change filtering part??? SAME FOR ALERTS METADATA!!!
  filtering: {
    from: string
    to: string
    queryParams?: { [key: string]: string | number }
  }
  sorting: SortParams
  pagination: {
    itemDescription: string
    previous: { href: string; text: string }
    next: { href: string; text: string }
    page: number
    offset: number
    pageSize: number
    totalPages: number
    totalElements: number
    elementsOnPage: number
    pages: { href: string; text: string; selected: boolean; type?: string }[]
  }
}
