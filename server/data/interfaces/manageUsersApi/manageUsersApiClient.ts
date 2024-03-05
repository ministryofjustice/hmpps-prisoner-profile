import UserEmailData from './UserEmailData'

export interface ManageUsersApiClient {
  getUserEmail(username: string): Promise<UserEmailData>
}
