import type CircuitBreaker from 'opossum'
import config from '../config'
import RestClient, { type Request } from './restClient'
import type { PersonApiClient, PersonRecord } from './interfaces/personApi'

export default class PersonApiRestClient extends RestClient implements PersonApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('Person API', config.apis.personApi, token, circuitBreaker)
  }

  getRecord(prisonerNumber: string): Promise<PersonRecord> {
    return this.get<PersonRecord>({ path: `/person/prison/${encodeURIComponent(prisonerNumber)}` }, this.token)
  }
}
