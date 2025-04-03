import { isFuture } from 'date-fns'
import { Validator } from '../../middleware/validationMiddleware'
import { isRealDate, parseDate } from '../../utils/dateHelpers'

export const dateValidator =
  ({
    namePrefix,
    label,
    missingText = null,
    checkHistoric = true,
  }: {
    namePrefix: string
    label: string
    missingText?: string
    checkHistoric?: boolean
  }): Validator =>
  (body: Record<string, string>) => {
    const errors = []

    const day = body[`${namePrefix}-day`]?.trim()
    const month = body[`${namePrefix}-month`]?.trim()
    const year = body[`${namePrefix}-year`]?.trim()

    const date = day && month && year ? `${day}/${month}/${year}` : null

    if ([day, year, month].filter(it => !it).length > 1)
      errors.push({
        text: missingText || `Enter a ${label.toLowerCase()}`,
        href: `#${namePrefix}`,
      })
    else if (!day) errors.push({ text: `${label} must include a day`, href: `#${namePrefix}-day` })
    else if (!month) errors.push({ text: `${label} must include a month`, href: `#${namePrefix}-month` })
    else if (!year) errors.push({ text: `${label} must include a year`, href: `#${namePrefix}-year` })

    if (date && !isRealDate(date)) {
      errors.push({ text: `${label} must be a real date`, href: `#${namePrefix}` })
    }

    if (checkHistoric && date && isRealDate(date) && isFuture(parseDate(date))) {
      errors.push({ text: `${label} must be in the past`, href: `#${namePrefix}` })
    }

    return errors
  }
