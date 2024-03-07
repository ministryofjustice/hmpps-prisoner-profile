import { PagedListItem } from './PagedList'

export default interface VisitWithVisitors extends PagedListItem {
  visitors: Visitor[]
  visitDetails: VisitDetails
}

export interface Visitor {}

export interface VisitDetails {}
