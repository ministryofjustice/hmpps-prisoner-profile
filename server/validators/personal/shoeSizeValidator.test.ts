import { shoeSizeValidator } from './shoeSizeValidator'

describe('shoeSizeValidator', () => {
  it.each([
    { shoeSize: null },
    { shoeSize: '' },
    { shoeSize: '1' },
    { shoeSize: '25' },
    { shoeSize: '12.5' },
    { shoeSize: '7.0' },
  ])('Valid request: %s', async ({ shoeSize }) => {
    const body = { shoeSize }
    const errors = await shoeSizeValidator(body)
    expect(errors.length).toEqual(0)
  })

  it.each([
    [{ shoeSize: '0' }, 'Enter a whole or half number between 1 and 25'],
    [{ shoeSize: '0.5' }, 'Enter a whole or half number between 1 and 25'],
    [{ shoeSize: '10.4' }, 'Enter a whole or half number between 1 and 25'],
    [{ shoeSize: '25.5' }, 'Enter a whole or half number between 1 and 25'],
    [{ shoeSize: 'Example' }, 'Enter this person’s shoe size'],
    [{ shoeSize: '12.abc123' }, 'Enter this person’s shoe size'],
    [{ shoeSize: '1aa2.abc123' }, 'Enter this person’s shoe size'],
  ])('Validations: %s: %s', async ({ shoeSize }: { shoeSize: string }, errorMessage: string) => {
    const body = { shoeSize }
    const errors = await shoeSizeValidator(body)

    expect(errors.length).toEqual(1)
    expect(errors[0].text).toEqual(errorMessage)
    expect(errors[0].href).toEqual('#shoeSize')
  })
})
