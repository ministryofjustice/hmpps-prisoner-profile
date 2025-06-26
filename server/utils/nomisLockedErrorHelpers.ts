export class NomisLockedError extends Error {
  status = 423

  constructor(message = 'Resource is locked') {
    super(message)
    this.name = 'LockedError'
  }
}

// Used to wrap around rest client calls in api clients. Throws the custom error.
export async function handleNomisLockedError<T>(apiClientFunction: () => Promise<T>): Promise<T> {
  try {
    return await apiClientFunction()
  } catch (e) {
    if (e?.status === 423) {
      throw new NomisLockedError(e.message)
    }
    throw e
  }
}
