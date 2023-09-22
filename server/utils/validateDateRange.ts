import { isBefore, isFuture } from 'date-fns'
import { HmppsError } from '../interfaces/hmppsError'
import { isRealDate, parseDate } from './dateHelpers'

export default (startDate: string, endDate: string) => {
  const errors: HmppsError[] = []

  if (startDate && !isRealDate(startDate)) {
    errors.push({ text: `'Date from' must be a real date`, href: '#startDate' })
  } else if (startDate && isFuture(parseDate(startDate))) {
    errors.push({ text: `'Date from' must be today or in the past`, href: '#startDate' })
  }

  if (endDate && !isRealDate(endDate)) {
    errors.push({ text: `'Date to (latest)' must be a real date`, href: '#endDate' })
  } else if (endDate && startDate && isBefore(parseDate(endDate), parseDate(startDate))) {
    errors.push({ text: `'Date to (latest)' must be after or the same as 'Date from (earliest) '`, href: '#endDate' })
  }

  return errors
}
