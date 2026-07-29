/**
 * For Spring api queries that return paginated results,
 * ie. something in the form of org.springframework.data.domain.Page
 * NB: this is simplified, there are many more page context fields
 */
export interface PageResponse<T> {
  /** Elements in this pages */
  content: T[]
  /** Page number (0-based) */
  number: number
  /** Page size */
  size: number
  /** Number of elements in this page */
  numberOfElements: number
  /** Total number of elements in all pages */
  totalElements: number
  /** Total number of pages */
  totalPages: number
}
