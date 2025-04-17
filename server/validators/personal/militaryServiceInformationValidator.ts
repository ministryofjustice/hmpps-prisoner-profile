import { isFuture } from 'date-fns'
import { Validator } from '../../middleware/validationMiddleware'
import { isRealDate, parseDate } from '../../utils/dateHelpers'

export const militaryServiceInformationValidator: Validator = (body: Record<string, string>) => {
  const {
    serviceNumber,
    militaryBranchCode,
    unitNumber,
    'startDate-year': startDateYear,
    'startDate-month': startDateMonth,
    enlistmentLocation,
    description,
  } = body
  const startDate = startDateYear && startDateMonth ? `01/${startDateMonth}/${startDateYear}` : null
  const errors = []

  if (serviceNumber?.length > 12) {
    errors.push({ text: 'Service number must be 12 characters or less', href: '#serviceNumber' })
  }

  if (!militaryBranchCode) {
    errors.push({ text: 'Select a military branch', href: '#militaryBranchCode' })
  }

  if (unitNumber?.length > 20) {
    errors.push({ text: 'Unit name must be 20 characters or less', href: '#unitNumber' })
  }

  if (!startDateYear && !startDateMonth) {
    errors.push({ text: 'Enter the date they enlisted in the armed forces', href: '#startDate' })
  } else if (!startDateYear) {
    errors.push({ text: 'The date they enlisted in the armed forces must include a year', href: '#startDate-year' })
  } else if (!startDateMonth) {
    errors.push({ text: 'The date they enlisted in the armed forces must include a month', href: '#startDate-month' })
  }

  if (startDate && !isRealDate(startDate)) {
    errors.push({
      text: 'Enter a real date',
      href: '#startDate',
    })
  }

  if (startDate && isRealDate(startDate) && isFuture(parseDate(startDate))) {
    errors.push({
      text: 'The date they enlisted in the armed forces must be in the past',
      href: '#startDate',
    })
  }

  if (enlistmentLocation?.length > 40) {
    errors.push({ text: 'Enlistment location must be 40 characters or less', href: '#enlistmentLocation' })
  }

  if (description?.length > 240) {
    errors.push({ text: 'Enter your comments using 240 characters or less', href: '#description' })
  }

  return errors
}
