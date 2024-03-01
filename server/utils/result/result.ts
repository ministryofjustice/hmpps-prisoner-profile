/**
 * `Result` extends the `PromiseSettledResult` type returned from `Promise.allSettled`,
 * adding some functions that make accessing and handling the result a bit easier,
 * avoiding the need for if else statements everywhere.
 */
export type Result<T, E extends Error = Error> = PromiseSettledResult<T> & {
  isFulfilled: () => boolean
  handle: <R1, R2>(handler: ResultHandler<T, E, R1, R2>) => R1 | R2
  getOrThrow: () => T
  getOrHandle: <R1>(handler: (e: E) => R1) => T | R1
  getOrNull: () => T
}

/**
 * `ResultHandler` allows two functions to be provided to handle both the success
 * and error case.
 */
export interface ResultHandler<T, E extends Error, R1, R2> {
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
   * `Result.of` wraps a function call in a try catch and returns a `Result`
   */
  of:
    <T, A extends unknown[]>(fn: (...args: A) => Promise<T>) =>
    async (...args: A): Promise<Result<T>> => {
      try {
        return Result.fulfilled(await fn(...args))
      } catch (e) {
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
  fulfilled: <T, E extends Error>(value: T): Result<T, E> => ({
    status: 'fulfilled',
    value,
    isFulfilled: () => true,
    handle: <R1, R2>(handler: ResultHandler<T, E, R1, R2>) => handler.fulfilled(value),
    getOrThrow: () => value,
    getOrHandle: () => value,
    getOrNull: () => value,
  }),

  /**
   * `Result.rejected` takes a value and produces an 'rejected' `Result`
   */
  rejected: <T, E extends Error>(error: E): Result<T, E> => ({
    status: 'rejected',
    reason: error,
    isFulfilled: () => false,
    handle: <R1, R2>(handler: ResultHandler<T, E, R1, R2>) => handler.rejected(error),
    getOrThrow: () => {
      throw error
    },
    getOrHandle: <R1>(handler: (e: E) => R1) => handler(error),
    getOrNull: () => null,
  }),
}
