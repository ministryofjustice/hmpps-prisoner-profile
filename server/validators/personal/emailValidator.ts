import HmppsError from '../../interfaces/HmppsError'

export const emailValidator = (body: Record<string, string>): HmppsError[] => {
  const { emailAddress } = body

  if (!emailAddress) {
    return [{ text: 'Enter an email address', href: '#emailAddress' }]
  }

  const errors = []

  if (!(emailAddress.length <= 240)) {
    errors.push({ text: 'Email address must be 240 characters or less', href: '#emailAddress' })
  }

  if (!emailAddress.includes('@')) {
    errors.push({ text: 'Email address must include an @ symbol', href: '#emailAddress' })
  }

  return errors
}

export default { emailValidator }
