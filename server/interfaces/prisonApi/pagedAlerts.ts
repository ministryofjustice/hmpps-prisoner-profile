import { Alert } from './alert'

export interface PagedAlerts {
  content: Alert[]
  pageable: {
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

export interface PagedAlertsOptions {
  alertStatus?: 'ACTIVE' | 'INACTIVE'
  size?: number
  sort?: [string, string][]
}
