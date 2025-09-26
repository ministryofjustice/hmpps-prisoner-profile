import config from '../config'
import RestClient from './restClient'
import { RestrictedPatientApiClient } from './interfaces/restrictedPatientApi/restrictedPatientApiClient'
import RestrictedPatient from './interfaces/restrictedPatientApi/RestrictedPatient'

export default class RestrictedPatientApiRestClient extends RestClient implements RestrictedPatientApiClient {
  constructor(token: string) {
    super('Restricted Patient API', config.apis.restrictedPatientApi, token)
  }

  async getRestrictedPatient(prisonerNumber: string): Promise<RestrictedPatient | null> {
    return this.getAndIgnore404({
      path: `/restricted-patient/prison-number/${prisonerNumber}`,
    })
  }
}
