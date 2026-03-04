import CircuitBreaker from 'opossum'
import RestClient, { Request } from './restClient'
import config from '../config'

interface PersonRecordIdentifiers {
  prisonNumbers?: string[]
}

export interface PersonRecord {
  identifiers?: PersonRecordIdentifiers
}

interface PersonApiClient {
  getRecord(prisonerNumber: string): Promise<PersonRecord>
}

export default class PersonApiRestClient extends RestClient implements PersonApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('Person API', config.apis.personApi, token, circuitBreaker)
  }

  async getRecord(prisonerNumber: string): Promise<PersonRecord> {
    return this.get<PersonRecord>({ path: `/person/prison/${prisonerNumber}` }, this.token)
  }
}
