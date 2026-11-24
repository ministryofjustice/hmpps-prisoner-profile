// eslint-disable-next-line import/prefer-default-export
export const justifiedHighProfilePrisonerAccessSpy = (): jest.Mocked<unknown> =>
  new Proxy(jest.fn(), {
    get(target, property, receiver) {
      if (typeof property === 'string' && property.length === 7) {
        // track property access as though it’s a function call
        target(property)
      }
      return Reflect.get(target, property, receiver)
    },
  })
