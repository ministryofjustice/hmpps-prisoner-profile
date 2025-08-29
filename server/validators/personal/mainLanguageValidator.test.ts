import { mainLanguageValidator } from './mainLanguageValidator'

describe('Main language validator', () => {
  it.each([{ interpreterRequired: 'true' }, { interpreterRequired: 'false' }])('Valid: %s', async body => {
    const errors = await mainLanguageValidator(body)
    expect(errors.length).toEqual(0)
  })

  it.each([[{}, 'Select if an interpreter is required', '#interpreterRequired']])(
    'Validations: %s: %s',
    async (body, errorMessage: string, errorHref: string) => {
      const errors = await mainLanguageValidator(body)

      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual(errorMessage)
      expect(errors[0].href).toEqual(errorHref)
    },
  )
})
