import { QueryParams } from './QueryParams'

export default interface SortParams {
  id: string
  label: string
  options: SortOption[]
  sort: string
  queryParams: QueryParams
}

export interface SortOption {
  value: string
  description: string
}
