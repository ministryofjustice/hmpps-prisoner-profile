import { emailValidator } from './emailValidator'

describe('Email validator', () => {
  it.each([{ emailAddress: 'foo@example.com' }])('Valid: %s', async ({ emailAddress }) => {
    const body = { emailAddress }
    const errors = emailValidator(body)
    expect(errors.length).toEqual(0)
  })

  it.each([
    [{ emailAddress: '' }, 'Enter an email address', '#emailAddress'],
    [{ emailAddress: `${'1'.repeat(240)}@email.com` }, 'Email address must be 240 characters or less', '#emailAddress'],
    [{ emailAddress: 'notanemail' }, 'Email address must include an @ symbol', '#emailAddress'],
  ])(
    'Validations: %s: %s',
    async ({ emailAddress }: { emailAddress: string }, errorMessage: string, errorHref: string) => {
      const body = {
        emailAddress,
      }
      const errors = emailValidator(body)

      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual(errorMessage)
      expect(errors[0].href).toEqual(errorHref)
    },
  )
})
