import type { PageResponse } from '../interfaces/PageResponse'

export function pageResponse<T>(
  content: T[],
  /** Page number (0-based) */
  number = 0,
  /** Total number of pages */
  totalPages = 1,
  /** Page size */
  size = 20,
  /** Total number of elements in all pages */
  totalElements?: number,
): PageResponse<T> {
  return {
    content,
    numberOfElements: content.length,
    number,
    totalPages,
    size,
    totalElements: totalElements ?? content.length,
  }
}

export function emptyPageResponse<T>(): PageResponse<T> {
  return pageResponse([])
}
