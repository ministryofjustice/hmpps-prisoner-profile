/**
 * Function that compares two dates, returning -1, 0 or 1 depending on whether the first date is before, equal to
 * or after the second date.
 * The sort direction can be controlled via the optional 3rd argument, where the default is descending.
 */
export default (date1: Date, date2: Date, direction: 'ASC' | 'DESC' = 'DESC'): number => {
  if (date1 > date2) {
    return direction === 'DESC' ? -1 : 1
  }
  if (date1 < date2) {
    return direction === 'DESC' ? 1 : -1
  }
  return 0
}
