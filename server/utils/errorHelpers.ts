/**
 * The errors we get sometimes have the status in .status but also can the status on .responseStatus.
 * As a result we need to handle both in the same way as an "any" type to prevent type errors where
 * there's no overlap.
 */
export const getErrorStatus = (error: unknown): number | undefined => {
  if (error && typeof error === 'object') {
    if ('status' in error && typeof error.status === 'number') {
      return error.status
    }
    if ('responseStatus' in error && typeof error.responseStatus === 'number') {
      return error.responseStatus
    }
  }
  return undefined
}

/** Returns true if error has any of the provided status codes */
export const errorHasStatus = (error: unknown, ...statuses: number[]): boolean => {
  const status = getErrorStatus(error)
  return (status && statuses.includes(status)) ?? false
}
