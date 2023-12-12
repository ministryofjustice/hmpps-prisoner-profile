import { UserEmailData } from '../../interfaces/manageUsersApi/userEmailData'

export interface ManageUsersApiClient {
  getUserEmail(username: string): Promise<UserEmailData>
}
