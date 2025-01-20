import { Validator } from '../../middleware/validationMiddleware'

export const religionValidator: Validator = (body: Record<string, string>) => {
  const { religion, currentReligionCode, reasonForChange, reasonForChangeUnknown, reasonKnown } = body
  const errors = []
  if (currentReligionCode && !religion) {
    errors.push({ href: '#religion', text: `Select this person's religion, faith or belief` })
  }
  if (currentReligionCode && !reasonKnown) {
    errors.push({
      href: '#reasonKnown',
      text: `Select yes if you know why this person's religion, faith or belief has changed`,
    })
  }
  if (reasonKnown === 'YES' && !reasonForChange) {
    errors.push({
      href: '#reasonForChange',
      text: `Enter why this person's religion, faith or belief has changed`,
    })
  }
  if (reasonForChange?.length > 4000) {
    errors.push({
      href: '#reasonForChange',
      text: `The reason why this person's religion, faith or belief has changed must be 4,000 characters or less`,
    })
  }
  if (reasonForChangeUnknown?.length > 4000) {
    errors.push({
      href: '#reasonForChange',
      text: `The details about this change must be 4,000 characters or less`,
    })
  }

  return errors
}
