import { IdentifierMappings } from '../../data/constants/identifierMappings'

export interface IdentityNumberSubmission {
  value?: string
  comment?: string
  selected?: string
}

export const identityNumbersValidator = (body: Record<string, IdentityNumberSubmission>) => {
  // const { pnc, cro } = body
  const errors: { text: string; href: string }[] = []

  Object.entries(body).forEach(([key, value]) => {
    if (value.selected === '' && !value.value) {
      errors.push({
        text: `Enter this person’s ${IdentifierMappings[key]?.label ?? 'ID number'}`,
        href: `#${key}-value-input`,
      })
    }

    if (value.value && value.value.length > 20) {
      errors.push({ text: 'Enter the ID number using 20 characters or less', href: `#${key}-value-input` })
    }

    if (value.comment && value.comment.length > 240) {
      errors.push({ text: 'Enter your comment using 240 characters or less', href: `#${key}-comments-input` })
    }
  })

  // Special PNC validation
  // if (pnc && pnc.value) {
  //   errors.push({ text: 'Some error happened, oh no', href: '#pnc-value-input' })
  // }

  // Special CRO validation

  return errors
}
