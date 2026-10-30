import type CircuitBreaker from 'opossum'
import config from '../config'
import RestClient, { type Request } from './restClient'
import type {
  DpsPersonRecord,
  PersonApiClient,
  PersonApiReferenceDataCode,
  PersonRecord,
  UpdateReligionRequest,
} from './interfaces/personApi'

export default class PersonApiRestClient extends RestClient implements PersonApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('Person API', config.apis.personApi, token, circuitBreaker)
  }

  getReligionCodes(activeOnly = false): Promise<PersonApiReferenceDataCode[]> {
    return this.get({ path: '/person/reference-data/religion-codes', query: { active: activeOnly } }, this.token)
  }

  getRecord(prisonerNumber: string, withReligionHistory?: false): Promise<PersonRecord>

  getRecord(prisonerNumber: string, withReligionHistory: true): Promise<DpsPersonRecord>

  getRecord(prisonerNumber: string, withReligionHistory = false): Promise<PersonRecord | DpsPersonRecord> {
    return withReligionHistory
      ? this.get<DpsPersonRecord>({ path: `/person/prison/dps/${encodeURIComponent(prisonerNumber)}` }, this.token)
      : this.get<PersonRecord>({ path: `/person/prison/${encodeURIComponent(prisonerNumber)}` }, this.token)
  }

  updateReligion(prisonerNumber: string, request: UpdateReligionRequest): Promise<void> {
    return this.put(
      {
        path: `/person/prison/${prisonerNumber}/religion`,
        data: request,
      },
      this.token,
    )
  }
}
