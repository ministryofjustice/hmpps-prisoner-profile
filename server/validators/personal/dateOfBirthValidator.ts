import { endOfDay, isAfter, isBefore, startOfDay, subYears } from 'date-fns'
import { Validator } from '../../middleware/validationMiddleware'
import { parseDate } from '../../utils/dateHelpers'
import HmppsError from '../../interfaces/HmppsError'
import { dateValidator } from './dateValidator'

const validateDateWithinYearRange = ({
  namePrefix,
  minYearsAgo,
  maxYearsAgo,
}: {
  namePrefix: string
  minYearsAgo: number
  maxYearsAgo: number
}): Validator => {
  return (body: Record<string, string>) => {
    const day = body[`${namePrefix}-day`]
    const month = body[`${namePrefix}-month`]
    const year = body[`${namePrefix}-year`]
    const dateString = day && month && year ? `${day}/${month}/${year}` : null
    const parsedDate = parseDate(dateString)

    const minDate = startOfDay(subYears(new Date(), maxYearsAgo))
    const maxDate = endOfDay(subYears(new Date(), minYearsAgo))

    const errors: HmppsError[] = []

    if (isBefore(parsedDate, minDate)) {
      errors.push({
        text: `This person cannot be older than ${maxYearsAgo} years old. Enter a valid date of birth`,
        href: `#${namePrefix}`,
      })
    } else if (isAfter(parsedDate, maxDate)) {
      errors.push({
        text: `This person cannot be younger than ${minYearsAgo} years old. Enter a valid date of birth`,
        href: `#${namePrefix}`,
      })
    }

    return errors
  }
}

export const dateOfBirthValidator = ({
  namePrefix,
  label,
  missingText = null,
  checkHistoric = true,
  isRequired = true,
  minYearsAgo = 15,
  maxYearsAgo = 125,
}: {
  namePrefix: string
  label: string
  missingText?: string
  checkHistoric?: boolean
  isRequired?: boolean
  minYearsAgo?: number
  maxYearsAgo?: number
}): Validator => {
  return async (body: Record<string, string>) => {
    const baseErrors = await dateValidator({
      namePrefix,
      label,
      missingText,
      checkHistoric,
      isRequired,
    })(body)

    if (baseErrors.length === 0) {
      return validateDateWithinYearRange({
        namePrefix,
        minYearsAgo,
        maxYearsAgo,
      })(body)
    }

    return baseErrors
  }
}

export default { dateOfBirthValidator }
