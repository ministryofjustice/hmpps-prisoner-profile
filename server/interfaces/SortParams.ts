export default interface SortParams {
  id: string
  label: string
  options: SortOption[]
  sort: string
  queryParams: { [key: string]: string | number | boolean }
}

export interface SortOption {
  value: string
  description: string
}
