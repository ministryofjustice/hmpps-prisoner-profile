export default class RoleError extends Error {
  public status = 403

  constructor(message = 'Not authorised') {
    super(message)
    this.name = 'RoleError'
  }
}
