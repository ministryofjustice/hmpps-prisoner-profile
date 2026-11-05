import type CircuitBreaker from 'opossum'
import config from '../config'
import RestClient, { type Request } from './restClient'
import type { ManageUsersApiClient, PrisonUser } from './interfaces/manageUsersApi'

export default class ManageUsersApiRestClient extends RestClient implements ManageUsersApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('Manage Users API', config.apis.manageUsersApi, token, circuitBreaker)
  }

  getPrisonUser(username: string): Promise<PrisonUser> {
    return this.get({ path: `/prisonusers/${encodeURIComponent(username)}` }, this.token)
  }
}
