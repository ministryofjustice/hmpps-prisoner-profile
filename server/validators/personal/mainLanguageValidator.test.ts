import { mainLanguageValidator } from './mainLanguageValidator'

const validRequest = {
  preferredSpokenLanguageCode: 'ENG',
  preferredWrittenLanguageCode: 'ENG',
  interpreterRequired: 'false',
}

describe('Main language validator', () => {
  it('Allows valid request', async () => {
    const errors = await mainLanguageValidator(validRequest)
    expect(errors.length).toEqual(0)
  })

  it('interpreterRequired field is optional', async () => {
    const request = {
      ...validRequest,
      interpreterRequired: undefined as string,
    }
    const errors = await mainLanguageValidator(request)
    expect(errors.length).toEqual(0)
  })

  it.each([
    [
      'Main spoken language is mandatory',
      { ...validRequest, preferredSpokenLanguageCode: undefined },
      'Enter this person’s main spoken language',
      '#preferred-spoken-language-code',
    ],
    [
      'Main written language is mandatory',
      { ...validRequest, preferredWrittenLanguageCode: undefined },
      'Enter this person’s main written language',
      '#preferred-written-language-code',
    ],
  ])('Validations: %s', async (_, body, errorMessage: string, errorHref: string) => {
    const errors = await mainLanguageValidator(body)

    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual(errorMessage)
    expect(errors[0].href).toEqual(errorHref)
  })
})
