export default class AddressLookupError extends Error {
  status: number

  data: object

  constructor(message: string, status: number, data: object) {
    super(message)
    this.status = status
    this.data = data
  }
}
