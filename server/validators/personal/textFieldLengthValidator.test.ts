import { textFieldLengthValidator } from './textFieldLengthValidator'

describe('Text field length validator', () => {
  it.each([
    { length: 10, value: '123456789' },
    { length: 10, value: '1234567890' },
  ])('Valid request: %s', async ({ length, value }) => {
    const body = { fieldValue: value }
    const validator = textFieldLengthValidator({
      fieldName: 'fieldValue',
      displayName: 'Field value',
      maxLength: length,
    })
    const errors = await validator(body)
    expect(errors.length).toEqual(0)
  })

  it.each([
    // Invalid input
    [
      { length: 10, value: '12345678901', fieldName: 'fieldValue', displayName: 'Field value' },
      'Field value must be 10 characters or less.',
    ],
    [
      { length: 5, value: '123456', fieldName: 'fieldTwo', displayName: 'Field two' },
      'Field two must be 5 characters or less.',
    ],
  ])(
    'Validations: %s: %s',
    async (
      {
        length,
        value,
        fieldName,
        displayName,
      }: { length: number; value: string; fieldName: string; displayName: string },
      errorMessage: string,
    ) => {
      const body = { [fieldName]: value }
      const validator = textFieldLengthValidator({
        fieldName,
        displayName,
        maxLength: length,
      })

      const errors = await validator(body)

      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual(errorMessage)
      expect(errors[0].href).toEqual(`#${fieldName}`)
    },
  )
})
