import { SortParams } from './sortSelector'

export interface ListMetadata {
  filtering: {
    from: string
    to: string
    startDate: string
    endDate: string
    type: string
    subType: string
    queryParams?: { [key: string]: string | number | boolean }
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
    viewAllUrl?: string
  }
}
