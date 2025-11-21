import logger from '../../logger'
import { errorHasStatus } from './errorHelpers'

export class ProblemSavingError extends Error {
  // status = 423

  // endpoint: string

  constructor(message: string) {
    super(message)
    this.name = 'ProblemSavingError'
    // this.endpoint = endpoint
  }
}

// export async function handleProblemSavingError<T>(apiClientFunction: () => Promise<T>): Promise<T> {
//   try {
//     return await apiClientFunction()
//   } catch (e) {
//     if (errorHasStatus(e, 423)) {
//       logger.warn(`NomisLockedError: 423 status occurred when calling ${e.endpoint}`)
//       throw new ProblemSavingError(e.message, e.endpoint)
//     }
//     throw e
//   }
// }
