export default class NotFoundApiError extends Error {
  response: { status: number }

  constructor() {
    super()
    this.response = { status: 404 }
  }
}
