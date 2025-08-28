import { countryOfBirthValidator } from './countryOfBirthValidator'

describe('Country of birth validator', () => {
  it.each([
    { radioField: 'ENG' },
    {
      radioField: 'OTHER',
      autocompleteField: 'France',
    },
  ])('Valid: %s', async ({ radioField, autocompleteField }) => {
    const body = { radioField, autocompleteField }
    const errors = await countryOfBirthValidator(body)
    expect(errors.length).toEqual(0)
  })

  it.each([
    [{ radioField: 'OTHER' }, `Enter country name`, '#autocomplete'],
    [{ radioField: 'OTHER', autocompleteError: 'not-a-country' }, `This is not a valid country`, '#autocomplete'],
  ])(
    'Validations: %s: %s',
    async (
      { radioField, autocompleteError }: { radioField: string; autocompleteError: string },
      errorMessage: string,
      errorHref: string,
    ) => {
      const body = { radioField, autocompleteError }
      const errors = await countryOfBirthValidator(body)

      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual(errorMessage)
      expect(errors[0].href).toEqual(errorHref)
    },
  )
})
