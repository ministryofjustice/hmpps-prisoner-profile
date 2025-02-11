import { isFuture } from 'date-fns'
import { Validator } from '../../middleware/validationMiddleware'
import { isRealDate, parseDate } from '../../utils/dateHelpers'

export const dischargeDetailsValidator: Validator = (body: Record<string, string>) => {
  const { 'endDate-year': endDateYear, 'endDate-month': endDateMonth, dischargeLocation } = body
  const endDate = endDateYear && endDateMonth ? `01/${endDateMonth}/${endDateYear}` : null
  const errors = []

  if (!endDateYear && endDateMonth) {
    errors.push({ text: 'The date they left the armed forces must include a year', href: '#endDate-year' })
  } else if (!endDateMonth && endDateYear) {
    errors.push({ text: 'The date they left the armed forces must include a month', href: '#endDate-month' })
  }

  if (endDate && !isRealDate(endDate)) {
    errors.push({
      text: 'Enter a real date',
      href: '#endDate',
    })
  }

  if (endDate && isRealDate(endDate) && isFuture(parseDate(endDate))) {
    errors.push({
      text: 'The date they left the armed forces must be in the past',
      href: '#endDate',
    })
  }

  if (dischargeLocation?.length > 40) {
    errors.push({ text: 'Discharge location must be 40 characters or less', href: '#dischargeLocation' })
  }

  return errors
}
