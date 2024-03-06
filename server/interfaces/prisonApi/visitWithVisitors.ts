import { PagedListItem } from './pagedList'
import { VisitDetails } from './visitDetails'
import { Visitor } from './visitor'

export interface VisitWithVisitors extends PagedListItem {
  visitors: Visitor[]
  visitDetails: VisitDetails
}
