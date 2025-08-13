/*
  The errors we get sometimes have the status in .status but also can the status on .responseStatus.
  As a result we need to handle both in the same way as an "any" type to prevent type errors where 
  there's no overlap.
*/
export const getErrorStatus = (error: any): number | undefined => {
  if (error.status) return error.status
  if (error.responseStatus) return error.responseStatus
  return undefined
}

export const errorHasStatus = (error: any, status: number): boolean => {
  return getErrorStatus(error) === status
}
