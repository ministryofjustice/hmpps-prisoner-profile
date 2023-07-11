import { isFuture } from 'date-fns'
import { Validator } from '../middleware/validationMiddleware'
import { HmppsError } from '../interfaces/hmppsError'
import { isRealDate, parseDate } from '../utils/dateHelpers'

// eslint-disable-next-line import/prefer-default-export
export const CaseNoteValidator: Validator = (body: Record<string, string>) => {
  const errors: HmppsError[] = []
  let invalidTime = false

  if (!body.type) {
    errors.push({
      text: 'Select the case note type',
      href: '#type',
    })
  }

  if (!body.subType) {
    errors.push({
      text: 'Select the case note sub-type',
      href: '#subType',
    })
  }

  if (body.text && body.text.length > 4000) {
    errors.push({
      text: 'Enter what happened using 4,000 characters or less',
      href: '#text',
    })
  }

  if (!body.text || !body.text.trim()) {
    errors.push({
      text: 'Enter what happened',
      href: '#text',
    })
  }

  if (!body.date) {
    errors.push({
      text: 'Select the date when this happened',
      href: '#date',
    })
  }

  if (body.date && !isRealDate(body.date)) {
    errors.push({
      text: 'Enter a real date in the format DD/MM/YYYY - for example, 27/03/2023',
      href: '#date',
    })
  }

  if (body.date && isRealDate(body.date) && isFuture(parseDate(body.date))) {
    errors.push({
      text: 'Enter a date which is not in the future in the format DD/MM/YYYY - for example, 27/03/2020',
      href: '#date',
    })
  }

  // eslint-disable-next-line no-restricted-globals
  if (body.hours && isNaN(parseInt(body.hours, 10))) {
    invalidTime = true
    errors.push({
      text: 'Enter an hour using numbers only',
      href: '#hours',
    })
  }

  // eslint-disable-next-line no-restricted-globals
  if (body.minutes && isNaN(parseInt(body.minutes, 10))) {
    invalidTime = true
    errors.push({
      text: 'Enter the minutes using numbers only',
      href: '#minutes',
    })
  }

  if ((body.hours && parseInt(body.hours, 10) > 23) || !body.hours) {
    invalidTime = true
    errors.push({
      text: 'Enter an hour which is 23 or less',
      href: '#hours',
    })
  }

  if ((body.minutes && parseInt(body.minutes, 10) > 59) || !body.minutes) {
    invalidTime = true
    errors.push({
      text: 'Enter the minutes using 59 or less',
      href: '#minutes',
    })
  }

  if (!body.hours && !body.minutes) {
    invalidTime = true
    errors.push({
      text: 'Select the time when this happened',
      href: '#hours',
    })
  }

  if (!invalidTime) {
    const dateTime = body.date && parseDate(body.date).setHours(+body.hours, +body.minutes, 0)
    if (dateTime && dateTime > new Date().getTime()) {
      errors.push({
        text: 'Enter a time which is not in the future',
        href: '#hours',
      })
    }
  }

  return errors
}
