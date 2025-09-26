import { QueryParams } from '../../../interfaces/QueryParams'

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PagedListItem {
  // Extended by:
  // Alert
  // CaseNote
}

export default interface PagedList<TPagedListItem extends PagedListItem> {
  content: TPagedListItem[]
  pageable?: {
    sort: {
      empty: boolean
      sorted: boolean
      unsorted: boolean
    }
    offset: number
    pageSize: number
    pageNumber: number
    paged: boolean
    unpaged: boolean
  }
  totalPages: number
  last: boolean
  totalElements: number
  size: number
  number: number
  sort: {
    empty: boolean
    sorted: boolean
    unsorted: boolean
  }
  first: boolean
  numberOfElements: number
  empty: boolean
}

export interface PagedListQueryParams extends QueryParams {
  page?: number
  size?: number
  sort?: string
  showAll?: boolean
}

export interface AlertsListQueryParams extends PagedListQueryParams {
  alertStatus?: 'ACTIVE' | 'INACTIVE'
  alertType?: string | string[]
  type?: string
  from?: string
  to?: string
}

export interface CaseNotesListQueryParams extends PagedListQueryParams {
  type?: string
  subType?: string
  startDate?: string
  endDate?: string
  includeSensitive?: string
}

export interface VisitsListQueryParams extends PagedListQueryParams {
  fromDate?: string
  toDate?: string
  visitType?: string
  visitStatus?: string
  prisonId?: string
  cancellationReason?: string
}
