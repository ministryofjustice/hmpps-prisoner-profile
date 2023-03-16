export interface OffenderAttendanceHistory {
  content: OffenderAttendenceItem[]
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
  totalElements: number
  last: boolean
  totalPages: number
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

export interface OffenderAttendenceItem {
  bookingId: number
  eventDate: string
  code: string
  outcome?: string
  description: string
  prisonId: string
  activity: string
}
