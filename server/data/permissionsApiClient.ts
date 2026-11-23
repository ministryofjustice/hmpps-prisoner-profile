import type CircuitBreaker from 'opossum'
import config from '../config'
import RestClient, { type Request } from './restClient'
import type { PermissionsApi } from './interfaces/permissionsApi'

export interface HighProfilePrisonerRequest {
  prisonerNumbersToCheck: string[]
}
export interface HighProfilePrisonerResponse {
  highProfilePrisoners: string[]
}

export default class PermissionsApiRestClient extends RestClient implements PermissionsApi {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('Permissions API', config.apis.permissionsApi, token, circuitBreaker)
  }

  async checkHighProfilePrisonerStatus(prisonerNumber: string): Promise<boolean> {
    if (config.apis.permissionsApi.highProfilePrisonersOverrideList?.length > 0) {
      return config.apis.permissionsApi.highProfilePrisonersOverrideList.includes(prisonerNumber)
    }
    const statuses = await this.checkHighProfilePrisonerStatuses([prisonerNumber])
    return statuses.get(prisonerNumber)
  }

  private async checkHighProfilePrisonerStatuses(prisonerNumbersToCheck: string[]): Promise<Map<string, boolean>> {
    // return new Map(prisonerNumbersToCheck.map(prisonerNumber => [prisonerNumber, true]))
    const statuses = await this.post<HighProfilePrisonerResponse>(
      {
        path: '/api/high-profile-prisoners',
        data: { prisonerNumbersToCheck } satisfies HighProfilePrisonerRequest,
      },
      this.token,
    )
    const highProfilePrisoners = new Set(statuses.highProfilePrisoners)
    return new Map(
      prisonerNumbersToCheck.map(prisonerNumber => [prisonerNumber, highProfilePrisoners.has(prisonerNumber)]),
    )
  }
}
