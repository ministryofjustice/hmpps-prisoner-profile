export default class NotFoundApiError extends Error {
  status: number

  constructor() {
    super()
    this.status = 404
  }
}
