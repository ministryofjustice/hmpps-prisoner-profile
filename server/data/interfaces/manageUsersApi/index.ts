export interface PrisonUser {
  username: string
  firstName: string
  lastName: string
}

export interface ManageUsersApiClient {
  getPrisonUser(username: string): Promise<PrisonUser>
}
