export default class BadRequestError extends Error {
  public status = 400

  constructor(message = 'Bad Request') {
    super(message)
    this.name = 'BadRequestError'
  }
}
