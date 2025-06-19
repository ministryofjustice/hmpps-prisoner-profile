import HmppsError from '../../interfaces/HmppsError'

export const emailValidator = (body: Record<string, string>): HmppsError[] => {
  const { emailAddress } = body

  if (!emailAddress) {
    return [{ text: 'Enter an email address', href: '#email-address' }]
  }

  if (!(emailAddress.length <= 240)) {
    return [{ text: 'Email address must be 240 characters or less', href: '#email-address' }]
  }

  if (!emailAddress.includes('@')) {
    return [{ text: 'Email address must include an @ symbol', href: '#email-address' }]
  }

  return []
}
