import { isFuture } from 'date-fns'
import { Validator } from '../../middleware/validationMiddleware'
import { isRealDate, parseDate } from '../../utils/dateHelpers'
import HmppsError from '../../interfaces/HmppsError'

export const dateValidator =
  ({
    namePrefix,
    label,
    missingText = null,
    checkHistoric = true,
    isRequired = true,
  }: {
    namePrefix: string
    label: string
    missingText?: string
    checkHistoric?: boolean
    isRequired?: boolean
  }): Validator =>
  (body: Record<string, string>) => {
    return [
      ...validateDate(
        body[`${namePrefix}-day`],
        body[`${namePrefix}-month`],
        body[`${namePrefix}-year`],
        namePrefix,
        label,
        missingText,
        checkHistoric,
        isRequired,
      ),
    ]
  }

export const validateDate = (
  day: string,
  month: string,
  year: string,
  namePrefix: string,
  label: string,
  missingText?: string,
  checkHistoric?: boolean,
  isRequired?: boolean,
): HmppsError[] => {
  const errors: HmppsError[] = []
  const date = day && month && year ? `${day}/${month}/${year}` : null

  const missingFields = [day, month, year].filter(it => !it).length

  if ((isRequired && missingFields > 1) || (!isRequired && missingFields === 2)) {
    errors.push({ text: missingText || `Enter a ${label.toLowerCase()}`, href: `#${namePrefix}` })
  } else if (isRequired || missingFields === 1) {
    if (!day) errors.push({ text: `${label} must include a day`, href: `#${namePrefix}-day` })
    else if (!month) errors.push({ text: `${label} must include a month`, href: `#${namePrefix}-month` })
    else if (!year) errors.push({ text: `${label} must include a year`, href: `#${namePrefix}-year` })
  }
  if (date && !isRealDate(date)) {
    errors.push({ text: `${label} must be a real date`, href: `#${namePrefix}` })
  }

  if (checkHistoric && date && isRealDate(date) && isFuture(parseDate(date))) {
    errors.push({ text: `${label} must be in the past`, href: `#${namePrefix}` })
  }

  return errors
}
