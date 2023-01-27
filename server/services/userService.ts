import { convertToTitleCase } from '../utils/utils'
import type HmppsAuthClient from '../data/hmppsAuthClient'

interface UserDetails {
  name: string
  displayName: string
}

export default class UserService {
  constructor(private readonly hmppsAuthClient: HmppsAuthClient) {}

  async getOffender(token: string): Promise<any> {
    const offender = await this.hmppsAuthClient.getOffender(token, 'G6123VU')
    return { offender }
  }

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

  async getUserCaseLoads(token: string): Promise<any> {
    const caseLoads = await this.hmppsAuthClient.getUserCaseLoads(token)
    return { caseLoads }
  }

  async getUserCaseNoteTypes(token: string): Promise<any> {
    const caseNoteTypes = await this.hmppsAuthClient.getUserCaseNoteTypes(token)
    return { caseNoteTypes }
  }

  async postUserCaseNote(token: string): Promise<any> {
    const caseLoads = await this.hmppsAuthClient.postUserCaseNote(token)
    return { caseLoads }
  }

  async getUserCaseNote(token: string): Promise<any> {
    const caseNote = await this.hmppsAuthClient.getUserCaseNote(token)
    return { caseNote }
  }
}
