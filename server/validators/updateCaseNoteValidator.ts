import { Validator } from '../middleware/validationMiddleware'
import { HmppsError } from '../interfaces/hmppsError'
import { pluralise } from '../utils/pluralise'

export const prisonApiAdditionalCaseNoteTextLength = 53

// eslint-disable-next-line import/prefer-default-export
export const UpdateCaseNoteValidator: Validator = (body: Record<string, string>) => {
  const errors: HmppsError[] = []

  // If the case note is stored outside NOMIS (isExternal), each update can use 4000 characters
  // If the case note is stored in NOMIS (not isExternal), it has a total 4000 characters for the original text plus ALL updates
  // Prison API adds " ...[%s updated the case notes on yyyy/MM/dd HH:mm:ss] " to each NOMIS update (%s is variable length username)
  const maxLength =
    body.isExternal === 'true'
      ? 4000
      : 4000 - Number(body.currentLength) - prisonApiAdditionalCaseNoteTextLength - body.username.length

  if (body.text && body.text.length > maxLength) {
    errors.push({
      text: `Enter additional details using ${pluralise(maxLength, 'character')} or less`,
      href: '#text',
    })
  }

  if (!body.text || !body.text.trim()) {
    errors.push({
      text: 'Enter additional details',
      href: '#text',
    })
  }

  return errors
}
