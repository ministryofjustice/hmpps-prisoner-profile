import logger from '../../logger'

export class NomisLockedError extends Error {
  status = 423

  constructor(message = 'Resource is locked') {
    super(message)
    this.name = 'NomisLockedError'
  }
}

export async function handleNomisLockedError<T>(apiClientFunction: () => Promise<T>): Promise<T> {
  try {
    return await apiClientFunction()
  } catch (e) {
    if (e.status === 423) {
      logger.warn(`NomisLockedError: 423 status occurred when calling ${e.endpoint}`)
      throw new NomisLockedError(e.message)
    }
    throw e
  }
}
