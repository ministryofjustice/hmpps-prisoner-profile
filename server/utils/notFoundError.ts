import { HmppsStatusCode } from '../data/enums/hmppsStatusCode'

export default class NotFoundError extends Error {
  public status = 404

  public hmppsStatus: HmppsStatusCode

  constructor(message = 'Not found', hmppsStatusCode: HmppsStatusCode = HmppsStatusCode.NOT_FOUND) {
    super(message)
    this.name = 'NotFoundError'
    this.hmppsStatus = hmppsStatusCode
  }
}
