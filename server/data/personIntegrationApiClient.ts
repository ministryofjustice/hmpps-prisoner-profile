import RestClient from './restClient'
import {
  PersonIntegrationApiClient,
  ReferenceDataCodeDto,
} from './interfaces/personIntegrationApi/personIntegrationApiClient'
import config from '../config'

export default class PersonIntegrationApiRestClient implements PersonIntegrationApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Person Integration API', config.apis.personIntegrationApi, token)
  }

  updateBirthPlace(prisonerNumber: string, birthPlace: string): Promise<void> {
    return this.restClient.patch({
      path: '/v1/core-person-record',
      query: { prisonerNumber },
      data: { fieldName: 'BIRTHPLACE', value: birthPlace },
    })
  }

  getReferenceDataCodes(domain: string): Promise<ReferenceDataCodeDto[]> {
    return this.restClient.get({ path: `/v1/core-person-record/reference-data/domain/${domain}/codes` })
  }
}
