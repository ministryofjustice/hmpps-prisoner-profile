import UserEmailData from './UserEmailData'
import { User } from './User'

export interface ManageUsersApiClient {
  getUser(): Promise<User>
  getUserEmail(username: string): Promise<UserEmailData>
}
