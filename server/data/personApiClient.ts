import type CircuitBreaker from 'opossum'
import config from '../config'
import RestClient, { type Request } from './restClient'
import type {
  PersonApiClient,
  PersonApiReferenceDataCode,
  PersonRecord,
  ReligionHistoryItem,
  UpdateReligionRequest,
} from './interfaces/personApi'

export default class PersonApiRestClient extends RestClient implements PersonApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('Person API', config.apis.personApi, token, circuitBreaker)
  }

  getReligionCodes(activeOnly = false): Promise<PersonApiReferenceDataCode[]> {
    return this.get({ path: '/person/reference-data/religion-codes', query: { active: activeOnly } }, this.token)
  }

  getRecord(prisonerNumber: string): Promise<PersonRecord> {
    return this.get({ path: `/person/prison/${encodeURIComponent(prisonerNumber)}` }, this.token)
  }

  getReligionHistory(prisonerNumber: string): Promise<ReligionHistoryItem[]> {
    return this.get({ path: `/person/prison/${encodeURIComponent(prisonerNumber)}/religion-history` }, this.token)
  }

  updateReligion(prisonerNumber: string, request: UpdateReligionRequest): Promise<void> {
    return this.put(
      {
        path: `/person/prison/${encodeURIComponent(prisonerNumber)}/religion`,
        data: request,
      },
      this.token,
    )
  }
}
