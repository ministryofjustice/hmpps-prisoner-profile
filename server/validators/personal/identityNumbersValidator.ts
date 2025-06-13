import { IdentifierMappings } from '../../data/constants/identifierMappings'
import HmppsError from '../../interfaces/HmppsError'

export interface IdentityNumberSubmission {
  value?: string
  comment?: string
  selected?: string
}

const MAX_LENGTH = 20
const MAX_COMMENT_LENGTH = 240

const pncRegex = /^\d{2,4}\/?\d{1,7}[A-Z]$/
const croRegex = /^\d{1,6}\/\d{2}[A-Z]$/
const croSfRegex = /^SF\d{2}\/\d{1,6}[A-Z]$/

export const identityNumbersValidator = (body: Record<string, IdentityNumberSubmission>) => {
  const errors: HmppsError[] = []

  Object.entries(body).forEach(([key, value]) => {
    if (value.selected === '' && !value.value) {
      errors.push({
        text: `Enter this person’s ${IdentifierMappings[key]?.label ?? 'ID number'}`,
        href: `#${key}-value-input`,
      })
    }

    if (value.value && value.value.length > MAX_LENGTH) {
      errors.push({ text: `Enter the ID number using ${MAX_LENGTH} characters or less`, href: `#${key}-value-input` })
    }

    if (value.comment && value.comment.length > MAX_COMMENT_LENGTH) {
      errors.push({
        text: `Enter your comment using ${MAX_COMMENT_LENGTH} characters or less`,
        href: `#${key}-comments-input`,
      })
    }
  })

  const { pnc, cro } = body
  validatePnc(pnc?.value, errors)
  validateCro(cro?.value, errors)

  return errors
}

const validatePnc = (input: string, errors: HmppsError[]) => {
  if (!input || input.length > MAX_LENGTH) {
    return
  }

  const sanitized = input?.toUpperCase() || ''
  if (!pncRegex.test(sanitized)) {
    errors.push({
      text: 'Enter a PNC number in the correct format, exactly as it appears on the document',
      href: '#pnc-value-input',
    })
  }
}

const validateCro = (input: string, errors: HmppsError[]) => {
  if (!input || input.length > MAX_LENGTH) {
    return
  }

  const sanitized = input?.toUpperCase() || ''
  if (!croRegex.test(sanitized) && !croSfRegex.test(sanitized)) {
    errors.push({
      text: 'Enter a CRO number in the correct format, exactly as it appears on the document',
      href: '#cro-value-input',
    })
  }
}
