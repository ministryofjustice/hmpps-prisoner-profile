export default class NotFoundError extends Error {
  public status = 404

  constructor(message = 'Not found') {
    super(message)
    this.name = 'NotFoundError'
  }
}
