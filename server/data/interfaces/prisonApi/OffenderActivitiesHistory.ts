export default interface OffenderActivitiesHistory {
  content: OffenderHistory[]
  pageable: PageableData
  totalElements: number
  last: boolean
  totalPages: number
  size: number
  number: number
  sort: {
    empty: boolean
    unsorted: boolean
    sorted: boolean
  }
  first: boolean
  numberOfElements: number
  empty: boolean
}

interface PageableData {
  sort: Sort
  offset: number
  pageSize: number
  pageNumber: number
  paged: boolean
  unpaged: boolean
}

interface Sort {
  empty: boolean
  unsorted: boolean
  sorted: boolean
}

interface OffenderHistory {
  bookingId: number
  agencyLocationId: string
  agencyLocationDescription: string
  description: string
  startDate: string
  endDate?: string
  endReasonCode?: string
  endReasonDescription?: string
  endCommentText?: string
  isCurrentActivity: boolean
}
