import config from '../config'
import RestClient from './restClient'
import UserEmailData from './interfaces/manageUsersApi/UserEmailData'
import { ManageUsersApiClient } from './interfaces/manageUsersApi/manageUsersApiClient'
import logger from '../../logger'
import { User } from './interfaces/manageUsersApi/User'

export default class ManageUsersApiRestClient implements ManageUsersApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Manage Users API', config.apis.manageUsersApi, token)
  }

  getUser(): Promise<User> {
    logger.info(`Getting user details: calling HMPPS Auth`)
    return this.restClient.get({ path: '/users/me' }) as Promise<User>
  }

  async getUserEmail(username: string): Promise<UserEmailData> {
    return this.restClient.get<UserEmailData>({
      path: `/users/${username}/email`,
      ignore404: true,
    })
  }
}
