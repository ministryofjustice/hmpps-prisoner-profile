import { radioFieldValidator } from './radioFieldValidator'

describe('Text field length validator', () => {
  it.each([{ value: '123456789' }])('Valid request: %s', async ({ value }) => {
    const body = { fieldValue: value }
    const validator = radioFieldValidator({
      fieldName: 'fieldValue',
      href: 'fieldHref',
      fieldDisplayName: 'Field value',
    })
    const errors = await validator(body)
    expect(errors.length).toEqual(0)
  })

  it.each([
    [{ fieldName: 'fieldValue', href: 'fieldHref', fieldDisplayName: 'Field value' }, 'Select Field value'],
    [{ fieldName: 'fieldTwo', href: 'hrefTwo', fieldDisplayName: 'Field two' }, 'Select Field two'],
  ])(
    'Validations: %s: %s',
    async (
      { fieldName, href, fieldDisplayName }: { fieldName: string; href: string; fieldDisplayName: string },
      errorMessage: string,
    ) => {
      const body = {}
      const validator = radioFieldValidator({
        fieldName,
        href,
        fieldDisplayName,
      })

      const errors = await validator(body)

      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual(errorMessage)
      expect(errors[0].href).toEqual(`#${href}`)
    },
  )
})
