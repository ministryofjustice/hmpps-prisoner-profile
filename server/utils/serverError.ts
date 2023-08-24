export default class ServerError extends Error {
  public status = 500

  constructor(message = 'Server Error') {
    super(message)
    this.name = 'ServerError'
  }
}
