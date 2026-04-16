/**
 * The errors we get sometimes have the status in .status but also can the status on .responseStatus.
 * As a result we need to handle both in the same way as an "any" type to prevent type errors where
 * there's no overlap.
 */
export const getErrorStatus = (error: unknown): number | undefined => {
  if (typeof error === 'object' && error !== null) {
    if ('status' in error && typeof error.status === 'number') {
      return error.status
    }
    if ('responseStatus' in error && typeof error.responseStatus === 'number') {
      return error.responseStatus
    }
  }
  return undefined
}

export const errorHasStatus = (error: unknown, status: number): boolean => {
  return getErrorStatus(error) === status
}
