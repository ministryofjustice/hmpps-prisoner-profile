import { IdentifierMappings } from '../../data/constants/identifierMappings'
import HmppsError from '../../interfaces/HmppsError'
import { AddIdentityNumberSubmission } from '../../controllers/utils/identityNumbersController/buildIdentityNumberOptions'
import { EditIdentityNumberSubmission } from '../../controllers/identityNumbersController'
import { OffenderIdentifierType } from '../../data/interfaces/prisonApi/OffenderIdentifierType'
import { pncFormatValidator } from './identity-numbers/pncFormatValidator'
import { croFormatValidator } from './identity-numbers/croFormatValidator'

const MAX_LENGTH = 20
const MAX_COMMENT_LENGTH = 240

export const addIdentityNumbersValidator = (body: Record<string, AddIdentityNumberSubmission>) => {
  const errors: HmppsError[] = []

  Object.entries(body).forEach(([key, value]) => {
    if (value.selected) {
      if (!value.value) {
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
    }
  })

  const { pnc, cro } = body
  if (pnc?.selected) {
    validatePnc(pnc?.value, '#pnc-value-input', errors)
  }
  if (cro?.selected) {
    validateCro(cro?.value, '#cro-value-input', errors)
  }

  return errors
}

export const editIdentityNumberValidator = (body: EditIdentityNumberSubmission) => {
  const errors: HmppsError[] = []

  if (!body.value) {
    errors.push({
      text: 'Enter a number',
      href: `#identifier-value-input`,
    })
  }

  if (body.value && body.value.length > MAX_LENGTH) {
    errors.push({ text: `Enter the ID number using ${MAX_LENGTH} characters or less`, href: `#identifier-value-input` })
  }

  if (body.comment && body.comment.length > MAX_COMMENT_LENGTH) {
    errors.push({
      text: `Enter your comment using ${MAX_COMMENT_LENGTH} characters or less`,
      href: `#identifier-comments-input`,
    })
  }

  if (body.type === OffenderIdentifierType.PncNumber) {
    validatePnc(body.value, '#identifier-value-input', errors)
  }
  if (body.type === OffenderIdentifierType.CroNumber) {
    validateCro(body.value, '#identifier-value-input', errors)
  }

  return errors
}

const validatePnc = (input: string, href: string, errors: HmppsError[]) => {
  if (!input || input.length > MAX_LENGTH) {
    return
  }

  errors.push(...pncFormatValidator(input, href))
}

const validateCro = (input: string, href: string, errors: HmppsError[]) => {
  if (!input || input.length > MAX_LENGTH) {
    return
  }

  errors.push(...croFormatValidator(input, href))
}
