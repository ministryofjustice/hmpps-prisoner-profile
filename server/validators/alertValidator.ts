import { differenceInDays, isFuture } from 'date-fns'
import { Validator } from '../middleware/validationMiddleware'
import { HmppsError } from '../interfaces/hmppsError'
import { isRealDate, parseDate } from '../utils/dateHelpers'

export const AlertValidator: Validator = (body: Record<string, string>) => {
  const errors: HmppsError[] = []
  const { existingAlerts, alertType, alertCode, alertDate, comment, expiryDate } = body

  if (!alertType) {
    errors.push({
      text: 'Select the alert type',
      href: '#alertType',
    })
  }

  if (!alertCode) {
    errors.push({
      text: 'Select the alert code',
      href: '#alertCode',
    })
  }

  if (existingAlerts && existingAlerts.split(',').includes(alertCode)) {
    errors.push({
      text: 'Select an alert that does not already exist for this offender',
      href: '#alertCode',
    })
  }

  if (comment && comment.length > 1000) {
    errors.push({
      text: 'Enter why you are creating this alert using 1,000 characters or less',
      href: '#comment',
    })
  }

  if (!comment || !comment.trim()) {
    errors.push({
      text: 'Enter why you are creating this alert',
      href: '#comment',
    })
  }

  if (!alertDate) {
    errors.push({
      text: 'Select the alert start date',
      href: '#alertDate',
    })
  }

  if (alertDate && !isRealDate(alertDate)) {
    errors.push({
      text: 'Enter a real date in the format DD/MM/YYYY - for example, 27/03/2023',
      href: '#alertDate',
    })
  }

  if (alertDate && isRealDate(alertDate) && isFuture(parseDate(alertDate))) {
    errors.push({
      text: 'Enter a date which is not in the future in the format DD/MM/YYYY - for example, 27/03/2020',
      href: '#alertDate',
    })
  }

  if (alertDate && differenceInDays(new Date(), parseDate(alertDate)) > 7) {
    errors.push({
      text: 'Enter a date that is not more than 7 days in the past in the format DD/MM/YYYY - for example, 27/03/2020',
      href: '#alertDate',
    })
  }

  if (alertDate && expiryDate && parseDate(expiryDate) <= parseDate(alertDate)) {
    errors.push({
      text: "'Alert end date' must be later than the start date",
      href: '#expiryDate',
    })
  }

  return errors
}

export const AlertAddMoreDetailsValidator: Validator = (body: Record<string, string>) => {
  const errors: HmppsError[] = []
  const { comment } = body

  if (comment && comment.length > 1000) {
    errors.push({
      text: 'Enter your comments using 1,000 characters or less',
      href: '#comment',
    })
  }

  if (!comment || !comment.trim()) {
    errors.push({
      text: 'Enter your comments on this alert',
      href: '#comment',
    })
  }

  return errors
}

export const AlertCloseValidator: Validator = (body: Record<string, string>) => {
  const errors: HmppsError[] = []
  const { comment, expiryDate, today } = body

  if (comment && comment.length > 1000) {
    errors.push({
      text: 'Enter your comments using 1,000 characters or less',
      href: '#comment',
    })
  }

  if (!comment || !comment.trim()) {
    errors.push({
      text: 'Enter your comments on this alert',
      href: '#comment',
    })
  }

  if (today === 'no') {
    if (!expiryDate || !isRealDate(expiryDate)) {
      errors.push({
        text: 'Enter a real date in the format DD/MM/YYYY - for example, 27/03/2023',
        href: '#expiryDate',
      })
    }

    if (expiryDate && isRealDate(expiryDate) && !isFuture(parseDate(expiryDate))) {
      errors.push({
        text: 'Enter a date which is after today in the format DD/MM/YYYY - for example, 27/03/2029',
        href: '#expiryDate',
      })
    }
  }

  return errors
}
