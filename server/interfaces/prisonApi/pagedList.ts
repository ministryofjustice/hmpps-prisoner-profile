import { Alert } from './alert'

export interface PagedList {
  content: Alert[] // TODO add other interfaces here as required, e.g. CaseNote
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

export interface PagedListQueryParams {
  page?: number
  size?: number
  sort?: string
  from?: string
  to?: string
  alertStatus?: 'ACTIVE' | 'INACTIVE'
  alertType?: string | string[]
}
