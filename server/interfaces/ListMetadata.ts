import SortParams from './SortParams'

export default interface ListMetadata<TGeneric> {
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
    pages: { href: string; text: string; selected: boolean; type?: string }[]
    viewAllUrl?: string
  }
}
