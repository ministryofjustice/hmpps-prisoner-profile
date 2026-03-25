import SortParams from './SortParams'

export interface ListMetadata<TGeneric> {
  filtering: {
    queryParams?: { [key: string]: string | number | boolean }
  } & TGeneric
  sorting?: SortParams
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
    pages: ListMetadataPage[]
    viewAllUrl?: string
    enableShowAll: boolean
  }
}

export type ListMetadataPage =
  | {
      number: string
      href: string
      current?: boolean
    }
  | { ellipsis: true }
