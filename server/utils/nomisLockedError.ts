import logger from '../../logger'

export class NomisLockedError extends Error {
  status = 423

  endpoint: string

  constructor(message: string, endpoint: string) {
    super(message)
    this.name = 'NomisLockedError'
    this.endpoint = endpoint
  }
}

export async function handleNomisLockedError<T>(apiClientFunction: () => Promise<T>): Promise<T> {
  try {
    return await apiClientFunction()
  } catch (e) {
    if (e.status === 423) {
      logger.warn(`NomisLockedError: 423 status occurred when calling ${e.endpoint}`)
      throw new NomisLockedError(e.message, e.endpoint)
    }
    throw e
  }
}
