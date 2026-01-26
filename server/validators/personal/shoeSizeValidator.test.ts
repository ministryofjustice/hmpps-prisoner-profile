import { shoeSizeValidator } from './shoeSizeValidator'

describe('shoeSizeValidator', () => {
  it('should return an error if autocompleteError is present', async () => {
    const body = { autocompleteError: 'error!' }
    const errors = await shoeSizeValidator(body)

    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual('This is not a valid shoe size')
    expect(errors[0].href).toEqual('#autocomplete')
  })

  it('should return no errors if autocompleteError is not present', async () => {
    const body = { autocompleteField: '10' }
    const errors = await shoeSizeValidator(body)

    expect(errors.length).toEqual(0)
  })
})
