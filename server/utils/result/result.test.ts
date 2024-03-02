import { Result } from './result'

const error = new Error('Some error!')

describe('result', () => {
  describe('isFulfilled', () => {
    it('reports fulfilled', () => {
      expect(Result.fulfilled(1).isFulfilled()).toBeTruthy()
    })

    it('reports rejected', () => {
      expect(Result.rejected(error).isFulfilled()).toBeFalsy()
    })
  })

  describe('handle', () => {
    it('can handle a fulfilled result', () => {
      expect(Result.fulfilled(1).handle({ fulfilled: i => i + 1, rejected: _e => null })).toEqual(2)
      expect(Result.fulfilled('hello').handle({ fulfilled: s => `${s} there`, rejected: _e => null })).toEqual(
        'hello there',
      )
      expect(
        Result.fulfilled({ some: 'object' }).handle({
          fulfilled: o => ({ ...o, another: 'field' }),
          rejected: _e => null,
        }),
      ).toEqual({ some: 'object', another: 'field' })
    })

    it('can handle a rejected result', () => {
      expect(
        Result.rejected(error).handle({ fulfilled: value => value, rejected: e => ({ handled: e.message }) }),
      ).toEqual({
        handled: error.message,
      })
    })
  })

  describe('getOrThrow', () => {
    it.each([1, 'hello', { some: 'object' }])('can retrieve the value from a fulfilled result', value => {
      expect(Result.fulfilled(value).getOrThrow()).toEqual(value)
    })

    it('can throw an error from a rejected result', () => {
      expect(Result.rejected(error).getOrThrow).toThrow(error)
    })
  })

  describe('getOrHandle', () => {
    it.each([1, 'hello', { some: 'object' }])('can retrieve the value from a fulfilled result', value => {
      expect(Result.fulfilled(value).getOrHandle(e => e.message)).toEqual(value)
    })

    it('can handle an error from a rejected result', () => {
      expect(Result.rejected(error).getOrHandle(e => e.message)).toEqual(error.message)
    })
  })

  describe('getOrNull', () => {
    it.each([1, 'hello', { some: 'object' }])('can retrieve the value from a fulfilled result', value => {
      expect(Result.fulfilled(value).getOrNull()).toEqual(value)
    })

    it('returns null from a rejected result', () => {
      expect(Result.rejected(error).getOrNull()).toBeNull()
    })
  })

  describe('Result.from', () => {
    it('converts a PromiseFulfilledResult', async () => {
      const [promiseResult] = await Promise.allSettled([Promise.resolve(1)])
      expect(Result.from(promiseResult).getOrThrow()).toEqual(1)
    })

    it('converts a PromiseRejectedResult', async () => {
      const [promiseResult] = await Promise.allSettled([Promise.reject(error)])
      expect(Result.from(promiseResult).getOrThrow).toThrow(error)
    })
  })

  describe('Result.all', () => {
    it('returns results for an array of Promises', async () => {
      const [a, b, c, d] = await Result.all([
        Promise.resolve(1),
        Promise.resolve('hello'),
        Promise.resolve({ some: 'object' }),
        Promise.reject(error),
      ])

      expect(a.getOrThrow()).toEqual(1)
      expect(b.getOrThrow()).toEqual('hello')
      expect(c.getOrThrow()).toEqual({ some: 'object' })
      expect(d.getOrThrow).toThrow(error)
    })
  })

  describe('Result.wrap', () => {
    const functionReturnsAString = () => Promise.resolve('hello')
    const functionReturnsAnObject = (i: number, s: string) => Promise.resolve({ number: i, string: s })

    it('wraps individual functions in a try catch to return fulfilled results', async () => {
      // Can opt to only return Result objects for those functions we can handle, for example:

      const [a, b, c, d] = await Promise.all([
        Promise.resolve(1),
        Result.wrap(functionReturnsAString)(),
        Result.wrap(functionReturnsAnObject)(123, 'abc'),
        Promise.resolve(1.23),
      ])

      expect(a).toEqual(1)
      expect(b.getOrHandle(e => e.message)).toEqual('hello')
      expect(c.getOrHandle(e => e.message)).toEqual({ number: 123, string: 'abc' })
      expect(d).toEqual(1.23)
    })

    it('wraps individual functions in a try catch to safely return rejected results', async () => {
      const [a, b, c, d] = await Promise.all([
        Promise.resolve(1),
        Result.wrap(() => Promise.reject(error))(),
        Result.wrap((_i: number, _s: string) => Promise.reject(error))(123, 'abc'),
        Promise.resolve(1.23),
      ])

      expect(a).toEqual(1)
      expect(b.getOrThrow).toThrow(error)
      expect(c.getOrThrow).toThrow(error)
      expect(d).toEqual(1.23)
    })
  })

  describe('Result.map', () => {
    it('maps a fulfilled result', () => {
      expect(
        Result.fulfilled(1)
          .map(value => value + 1)
          .getOrThrow(),
      ).toEqual(2)
    })

    it('maps a rejected result to itself', () => {
      expect(Result.rejected(error).getOrThrow).toThrowError(error)
    })
  })
})
