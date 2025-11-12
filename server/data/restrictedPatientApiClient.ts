import CircuitBreaker from 'opossum'
import config from '../config'
import RestClient, { Request } from './restClient'
import { RestrictedPatientApiClient } from './interfaces/restrictedPatientApi/restrictedPatientApiClient'
import RestrictedPatient from './interfaces/restrictedPatientApi/RestrictedPatient'

export default class RestrictedPatientApiRestClient extends RestClient implements RestrictedPatientApiClient {
  constructor(token: string, circuitBreaker?: CircuitBreaker<[Request<unknown, unknown>, string], unknown>) {
    super('Restricted Patient API', config.apis.restrictedPatientApi, token, circuitBreaker)
  }

  async getRestrictedPatient(prisonerNumber: string): Promise<RestrictedPatient | null> {
    return this.getAndIgnore404({
      path: `/restricted-patient/prison-number/${prisonerNumber}`,
    })
  }
}
