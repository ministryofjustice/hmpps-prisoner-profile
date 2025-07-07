import { emailValidator } from './emailValidator'

describe('Email validator', () => {
  it.each([{ emailAddress: 'foo@example.com' }])('Valid: %s', async ({ emailAddress }) => {
    const body = { emailAddress }
    const errors = emailValidator(body)
    expect(errors.length).toEqual(0)
  })

  it.each([
    [{ emailAddress: '' }, ['Enter an email address'], '#emailAddress'],
    [
      { emailAddress: `${'1'.repeat(240)}@email.com` },
      ['Email address must be 240 characters or less'],
      '#emailAddress',
    ],
    [{ emailAddress: 'notanemail' }, ['Email address must include an @ symbol'], '#emailAddress'],
    [
      { emailAddress: '1'.repeat(241) },
      ['Email address must be 240 characters or less', 'Email address must include an @ symbol'],
      '#emailAddress',
    ],
  ])(
    'Validations: %s: %s',
    async ({ emailAddress }: { emailAddress: string }, errorMessages: string[], errorHref: string) => {
      const body = {
        emailAddress,
      }
      const errors = emailValidator(body)

      expect(errors.length).toEqual(errorMessages.length)
      errorMessages.forEach(msg => {
        const errorWithMessage = errors.find(e => e.text === msg)
        expect(errorWithMessage).not.toBeNull()
        expect(errorWithMessage.href).toEqual(errorHref)
      })
    },
  )
})
