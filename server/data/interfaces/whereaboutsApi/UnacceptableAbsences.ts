import { PageableData } from './PageableQuery'
import Sort from './Sort'

export default interface UnacceptableAbsences {
  content: UnacceptableAbsencesItem[]
  pageable: PageableData
  totalElements: number
  last: boolean
  totalPages: number
  size: number
  number: number
  sort: Sort
  first: boolean
  numberOfElements: number
  empty: boolean
}

export interface UnacceptableAbsencesItem {
  eventDate: string
  activity: string
  activityDescription: string
  location: string
  comments: string
}
