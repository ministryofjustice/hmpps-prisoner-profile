/**
 * `Result` extends the `PromiseSettledResult` type returned from `Promise.allSettled`,
 * adding some functions that make accessing and handling the result a bit easier,
 * avoiding the need for if else statements everywhere.
 */
export type Result<T, E = Error> = PromiseSettledResult<T> & {
  isFulfilled: () => boolean
  map: <R, E2>(map: (value: T) => R, mapError?: (error: E) => E2) => Result<R, E2>
  handle: <R1, R2>(handler: ResultHandler<T, E, R1, R2>) => R1 | R2
  getOrThrow: () => T
  getOrHandle: <R>(handler: (e: E) => R) => T | R
  getOrNull: () => T
  toPromiseSettledResult: () => PromiseSettledResult<T>
}

/**
 * `ResultHandler` allows two functions to be provided to handle both the success
 * and error case.
 */
interface ResultHandler<T, E, R1, R2> {
  fulfilled(value: T): R1

  rejected(e: E): R2
}

export const Result = {
  /**
   * `Result.from` converts a `PromiseSettledResult` to a `Result` object
   */
  from: <T>(promiseResult: PromiseSettledResult<T>) => {
    if (promiseResult.status === 'fulfilled') {
      return Result.fulfilled(promiseResult.value)
    }

    return Result.rejected(promiseResult.reason) as Result<T>
  },

  /**
   * `Result.wrap` wraps a promise evaluation in a try catch and returns a `Result`,
   *  invoking a supplied callback on error
   */
  wrap: async <T>(promise: Promise<T>, onError: (e: Error) => void = () => null): Promise<Result<T>> => {
    try {
      return Result.fulfilled(await promise)
    } catch (e) {
      onError(e)
      return Result.rejected(e)
    }
  },

  /**
   * `Result.all` replaces `Promise.allSettled` returning the extended `Result` objects
   * instead of `PromiseSettledResults`
   */
  all: async <T extends readonly unknown[] | []>(
    values: T,
  ): Promise<{ -readonly [P in keyof T]: Result<Awaited<T[P]>> }> => {
    return (await Promise.allSettled(values)).map(Result.from) as {
      -readonly [P in keyof T]: Result<Awaited<T[P]>>
    }
  },

  /**
   * `Result.fulfilled` takes a value and produces a 'fulfilled' `Result`
   */
  fulfilled: <T, E>(value: T): Result<T, E> => ({
    status: 'fulfilled',
    value,
    isFulfilled: () => true,
    map: <R, E2>(map: (v: T) => R, _: (e: E) => E2) => Result.fulfilled<R, E2>(map(value)),
    handle: <R1, R2>(handler: ResultHandler<T, E, R1, R2>) => handler.fulfilled(value),
    getOrThrow: () => value,
    getOrHandle: () => value,
    getOrNull: () => value,
    toPromiseSettledResult: () => ({ status: 'fulfilled', value }),
  }),

  /**
   * `Result.rejected` takes a value and produces an 'rejected' `Result`
   */
  rejected: <T, E>(error: E): Result<T, E> => ({
    status: 'rejected',
    reason: error,
    isFulfilled: () => false,
    map: <R, E2>(_m: (v: T) => R, mapError: (e: E) => E2 = e => e as unknown as E2) =>
      Result.rejected<R, E2>(mapError(error)),
    handle: <R1, R2>(handler: ResultHandler<T, E, R1, R2>) => handler.rejected(error),
    getOrThrow: () => {
      throw error
    },
    getOrHandle: <R>(handler: (e: E) => R) => handler(error),
    getOrNull: () => null as T,
    toPromiseSettledResult: () => ({ status: 'rejected', reason: error }),
  }),
}

export const noCallbackOnErrorBecause = (_explanation: string) => (_error: Error) => {}
