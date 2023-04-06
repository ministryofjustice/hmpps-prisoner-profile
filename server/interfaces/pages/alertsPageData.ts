import { PagedList } from '../prisonApi/pagedList'
import { SortParams } from '../sortSelector'
import { AlertTypeFilter } from '../alertsMetadata'
import { HmppsError } from '../hmppsError'

export interface AlertsPageData {
  pagedAlerts: PagedList
  listMetadata: ListMetadata
  alertTypes: AlertTypeFilter[]
  activeAlertCount: number
  inactiveAlertCount: number
  fullName: string
  errors: HmppsError[]
}

export interface ListMetadata {
  filtering: {
    from: string
    to: string
    queryParams?: { [key: string]: string | number }
  }
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
