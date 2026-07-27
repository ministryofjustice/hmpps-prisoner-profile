type SortOption<O extends string> = O | `${O},ASC` | `${O},DESC`

/**
 * For Spring api queries that return paginated results,
 * ie. accept a parameter of the form org.springframework.data.domain.Pageable
 */
export interface PageRequest<SortBy extends string = string> {
  page?: number
  size?: number
  sort?: SortOption<SortBy> | SortOption<SortBy>[]
}
