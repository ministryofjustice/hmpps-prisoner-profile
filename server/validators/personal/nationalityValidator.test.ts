import { nationalityValidator } from './nationalityValidator'

describe('Nationality validators', () => {
  const messageExceedingMaxLength = 'a'.repeat(41)
  it.each([
    { radioField: 'BRIT' },
    { radioField: 'BRIT', additionalNationalities: 'Some value' },
    {
      radioField: 'OTHER',
      autocompleteField: 'France',
    },
  ])('Valid: %s', async ({ radioField, autocompleteField, additionalNationalities }) => {
    const body = { radioField, autocompleteField, additionalNationalities }
    const errors = await nationalityValidator(body)
    expect(errors.length).toEqual(0)
  })

  it.each([
    [{ radioField: 'OTHER' }, `Enter nationality`, '#autocomplete'],
    [{ radioField: 'OTHER__VALIDATION_ERROR' }, `This is not a valid nationality`, '#autocomplete'],
    [
      { radioField: 'BRIT', additionalNationalities: messageExceedingMaxLength },
      `Additional nationalities must be 40 characters or less`,
      '#additional-nationalities',
    ],
  ])(
    'Validations: %s: %s',
    async (
      { radioField, additionalNationalities }: { radioField: string; additionalNationalities: string },
      errorMessage: string,
      errorHref: string,
    ) => {
      const body = {
        radioField,
        additionalNationalities,
      }
      const errors = await nationalityValidator(body)

      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual(errorMessage)
      expect(errors[0].href).toEqual(errorHref)
    },
  )
})
