export interface SortOption {
  value: string
  description: string
}

export interface SortParams {
  id: string
  label: string
  options: SortOption[]
  sort: string
  queryParams: { [key: string]: string | number | boolean }
}
