import { PageableData } from '../whereaboutsApi/PageableQuery'

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

export interface OffenderHistory {
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
