import { differenceInDays, isBefore, isFuture, startOfDay } from 'date-fns'
import { Validator } from '../middleware/validationMiddleware'
import HmppsError from '../interfaces/HmppsError'
import { isRealDate, parseDate } from '../utils/dateHelpers'

export const AlertValidator: Validator = (body: Record<string, string>) => {
  const errors: HmppsError[] = []
  const { existingAlerts, alertType, alertCode, activeFrom, description, activeTo } = body

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

  if (description && description.length > 4000) {
    errors.push({
      text: 'Enter why you are creating this alert using 4,000 characters or less',
      href: '#description',
    })
  }

  if (!description || !description.trim()) {
    errors.push({
      text: 'Enter why you are creating this alert',
      href: '#description',
    })
  }

  if (!activeFrom) {
    errors.push({
      text: 'Select the alert start date',
      href: '#activeFrom',
    })
  }

  if (activeFrom && !isRealDate(activeFrom)) {
    errors.push({
      text: 'Enter a real date in the format DD/MM/YYYY - for example, 27/03/2023',
      href: '#activeFrom',
    })
  }

  if (activeFrom && isRealDate(activeFrom) && isFuture(parseDate(activeFrom))) {
    errors.push({
      text: 'Enter a date which is not in the future in the format DD/MM/YYYY - for example, 27/03/2020',
      href: '#activeFrom',
    })
  }

  if (activeFrom && differenceInDays(new Date(), parseDate(activeFrom)) > 7) {
    errors.push({
      text: 'Enter a date that is not more than 7 days in the past in the format DD/MM/YYYY - for example, 27/03/2020',
      href: '#activeFrom',
    })
  }

  if (activeFrom && activeTo && parseDate(activeTo) <= parseDate(activeFrom)) {
    errors.push({
      text: "'Alert end date' must be later than the start date",
      href: '#activeTo',
    })
  }

  return errors
}

export const AlertAddMoreDetailsValidator: Validator = (body: Record<string, string>) => {
  const errors: HmppsError[] = []
  const { description } = body

  if (description && description.length > 4000) {
    errors.push({
      text: 'Enter your comments using 4,000 characters or less',
      href: '#description',
    })
  }

  if (!description || !description.trim()) {
    errors.push({
      text: 'Enter your comments on this alert',
      href: '#description',
    })
  }

  return errors
}

export const AlertCloseValidator: Validator = (body: Record<string, string>) => {
  const errors: HmppsError[] = []
  const { description, activeTo, today } = body

  if (description && description.length > 4000) {
    errors.push({
      text: 'Enter your comments using 4,000 characters or less',
      href: '#description',
    })
  }

  if (!description || !description.trim()) {
    errors.push({
      text: 'Enter your comments on this alert',
      href: '#description',
    })
  }

  if (today === 'no') {
    if (!activeTo || !isRealDate(activeTo)) {
      errors.push({
        text: 'Enter an end date in the format DD/MM/YYYY - for example, 27/03/2023',
        href: '#activeTo',
      })
    }

    if (activeTo && isRealDate(activeTo) && !isFuture(parseDate(activeTo))) {
      errors.push({
        text: 'End date must be after today',
        href: '#activeTo',
      })
    }
  }

  return errors
}

export const AlertChangeEndDateValidator: Validator = (body: Record<string, string>) => {
  const errors: HmppsError[] = []
  const { description, activeTo, removeEndDate } = body

  if (description && description.length > 4000) {
    errors.push({
      text: 'Enter your comments using 4,000 characters or less',
      href: '#description',
    })
  }

  if (!description || !description.trim()) {
    errors.push({
      text: 'Enter your comments on this alert',
      href: '#description',
    })
  }

  if (!removeEndDate) {
    errors.push({
      text: 'Select if you would like to choose a different end date or remove the end date',
      href: '#removeEndDate',
    })
  } else if (removeEndDate === 'no') {
    if (!activeTo || !isRealDate(activeTo)) {
      errors.push({
        text: 'Enter an end date in the format DD/MM/YYYY - for example, 27/03/2023',
        href: '#activeTo',
      })
    }

    if (activeTo && isRealDate(activeTo) && isBefore(parseDate(activeTo), startOfDay(new Date()))) {
      errors.push({
        text: 'End date must be on or later than today',
        href: '#activeTo',
      })
    }
  }

  return errors
}
