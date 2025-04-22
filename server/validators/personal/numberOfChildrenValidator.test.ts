import { numberOfChildrenValidator } from './numberOfChildrenValidator'

describe('Number of children validator', () => {
  it.each([
    { hasChildren: undefined },
    { hasChildren: null },
    { hasChildren: 'NO' },
    { hasChildren: 'YES', numberOfChildren: '1' },
    { hasChildren: 'YES', numberOfChildren: '999' },
    { hasChildren: 'YES', numberOfChildren: '1E3' },
  ])('Valid: %s', async ({ hasChildren, numberOfChildren }) => {
    const body = { hasChildren, numberOfChildren }
    const errors = await numberOfChildrenValidator(body)
    expect(errors.length).toEqual(0)
  })

  it.each([
    [{ hasChildren: 'YES' }, `Enter the number of children.`, '#numberOfChildren'],
    [{ hasChildren: 'YES', numberOfChildren: null }, `Enter the number of children.`, '#numberOfChildren'],
    [{ hasChildren: 'YES', numberOfChildren: 'BADVALUE' }, `Enter the number of children.`, '#numberOfChildren'],
    [{ hasChildren: 'YES', numberOfChildren: '2.5' }, `Enter the number of children.`, '#numberOfChildren'],
    [{ hasChildren: 'YES', numberOfChildren: '0' }, `Enter the number of children.`, '#numberOfChildren'],
    [{ hasChildren: 'YES', numberOfChildren: '-1' }, `Enter the number of children.`, '#numberOfChildren'],
  ])(
    'Validations: %s: %s',
    async (
      { hasChildren, numberOfChildren }: { hasChildren: string; numberOfChildren: string },
      errorMessage: string,
      errorHref: string,
    ) => {
      const body = {
        hasChildren,
        numberOfChildren,
      }
      const errors = await numberOfChildrenValidator(body)

      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual(errorMessage)
      expect(errors[0].href).toEqual(errorHref)
    },
  )
})
