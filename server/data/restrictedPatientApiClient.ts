import config from '../config'
import RestClient from './restClient'
import { RestrictedPatientApiClient } from './interfaces/restrictedPatientApiClient'
import { RestrictedPatient } from '../interfaces/restrictedPatientApi/restrictedPatient'

export default class RestrictedPatientApiRestClient implements RestrictedPatientApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Restricted Patient API', config.apis.restrictedPatientApi, token)
  }

  async getRestrictedPatient(prisonerNumber: string): Promise<RestrictedPatient> {
    return this.restClient.get<RestrictedPatient>({
      path: `/restricted-patient/prison-number/${prisonerNumber}`,
      ignore404: true,
    })
  }
}
