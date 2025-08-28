import { otherLanguageValidator } from './otherLanguageValidator'

describe('Main language validator', () => {
  it.each([{ language: 'ENG' }])('Valid: %s', async body => {
    const errors = await otherLanguageValidator(body)
    expect(errors.length).toEqual(0)
  })

  it.each([[{}, 'Select a language', '#language']])(
    'Validations: %s: %s',
    async (body, errorMessage: string, errorHref: string) => {
      const errors = await otherLanguageValidator(body)

      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual(errorMessage)
      expect(errors[0].href).toEqual(errorHref)
    },
  )
})
