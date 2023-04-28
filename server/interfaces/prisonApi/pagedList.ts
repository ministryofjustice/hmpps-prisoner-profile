// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface PagedListItem {
  // Extended by:
  // Alert
  // CaseNote
}

export interface PagedList {
  content: PagedListItem[]
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

  type?: string
  subType?: string
  startDate?: string
  endDate?: string
}
