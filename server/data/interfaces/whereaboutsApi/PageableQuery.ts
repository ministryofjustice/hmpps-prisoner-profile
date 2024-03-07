import Sort from './Sort'

export default interface PageableQuery {
  page: number
  size: number
  sort: string[]
}

export interface PageableData {
  sort: Sort
  offset: number
  pageSize: number
  pageNumber: number
  paged: boolean
  unpaged: boolean
}
