import config from '../config'
import RestClient from './restClient'
import { UserEmailData } from '../interfaces/manageUsersApi/userEmailData'
import { ManageUsersApiClient } from './interfaces/manageUsersApiClient'

export default class ManageUsersApiRestClient implements ManageUsersApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Manage Users API', config.apis.manageUsersApi, token)
  }

  async getUserEmail(username: string): Promise<UserEmailData> {
    return this.restClient.get<UserEmailData>({
      path: `/users/${username}/email`,
      ignore404: true,
    })
  }
}
