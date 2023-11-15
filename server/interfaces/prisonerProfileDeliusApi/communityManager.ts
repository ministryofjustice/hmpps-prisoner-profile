export interface CommunityManager {
  code: string
  name: {
    forename: string
    surname: string
    email?: string
  }
  team: {
    code: string
    description: string
    email?: string
  }
  unallocated: boolean
}
