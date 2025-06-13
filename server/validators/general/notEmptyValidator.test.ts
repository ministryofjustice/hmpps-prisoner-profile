import { notEmptyValidator } from './notEmptyValidator'

const fieldName = 'myField'
const errorText = 'My error message'
const href = '#myhref'

describe('Not Empty Validator', () => {
  it.each([
    // Valid strings:
    ['something', true],
    ['  something  ', true],
    ['123', true],
    ['true', true],
    ['0', true],

    // Valid arrays:
    [['1'], true],
    [['1', '2'], true],

    // Invalid strings:
    [undefined, false],
    [null, false],
    ['', false],
    ['  ', false],
    ['\t', false],

    // Invalid arrays:
    [[], false],
  ])(`Value - '%s': %s`, async (value: string, valid: boolean) => {
    const body = { [fieldName]: value }
    const errors = await notEmptyValidator({ fieldName, errorText, href })({ body })

    if (valid) {
      expect(errors.length).toEqual(0)
    } else {
      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual(errorText)
      expect(errors[0].href).toEqual(href)
    }
  })

  it('handles the field not present in the body', async () => {
    const errors = await notEmptyValidator({ fieldName, errorText, href })({ body: {} })

    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual(errorText)
    expect(errors[0].href).toEqual(href)
  })
})
