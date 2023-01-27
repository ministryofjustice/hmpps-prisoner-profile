import { convertToTitleCase } from '../utils/utils'
import type HmppsAuthClient from '../data/hmppsAuthClient'

interface UserDetails {
  name: string
  displayName: string
}

export default class UserService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getUser(token: string): Promise<UserDetails> {
    const user = await this.hmppsAuthClient.getUser(token)
    return { ...user, displayName: convertToTitleCase(user.name) }
  }

  async getUserLocations(token: string): Promise<any> {
    const locations = await this.hmppsAuthClient.getUserLocations(token)
    return { locations }
  }

  async getUserRoles(token: string): Promise<any> {
    const roles = await this.hmppsAuthClient.getUserRoles(token)
    return { roles }
  }
}
