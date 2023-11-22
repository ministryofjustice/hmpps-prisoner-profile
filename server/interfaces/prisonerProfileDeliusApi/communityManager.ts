export interface CommunityManager {
  code: string
  name: {
    forename: string
    surname: string
  }
  team: {
    code: string
    description: string
    email?: string
    telephone?: string
  }
  email?: string
  telephone?: string
  unallocated: boolean
}
