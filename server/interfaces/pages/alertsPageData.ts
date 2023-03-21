import { PagedList } from '../prisonApi/pagedList'
import { SortParams } from '../sortSelector'

export interface AlertsPageData {
  pagedAlerts: PagedList
  listMetadata: ListMetadata
  alertsCodes: string[]
  activeAlertCount: number
  inactiveAlertCount: number
  fullName: string
}

export interface ListMetadata {
  sorting: SortParams
  pagination: {
    itemDescription: string
    previous: { href: string; text: string }
    next: { href: string; text: string }
    page: number
    offset: number
    pageSize: number
    totalPages: number
    totalElements: number
    elementsOnPage: number
    pages: { href: string; text: string; selected: boolean; type?: string }[]
  }
}
