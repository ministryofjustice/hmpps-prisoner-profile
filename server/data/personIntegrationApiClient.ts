import RestClient from './restClient'
import {
  MilitaryRecord,
  PersonIntegrationApiClient,
  ProxyReferenceDataDomain,
  ReferenceDataCodeDto,
} from './interfaces/personIntegrationApi/personIntegrationApiClient'
import config from '../config'

export default class PersonIntegrationApiRestClient implements PersonIntegrationApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Person Integration API', config.apis.personIntegrationApi, token)
  }

  updateBirthPlace(prisonerNumber: string, birthPlace: string): Promise<void> {
    return this.updateCorePersonRecord(prisonerNumber, 'BIRTHPLACE', birthPlace)
  }

  updateNationality(prisonerNumber: string, nationality: string): Promise<void> {
    return this.updateCorePersonRecord(prisonerNumber, 'NATIONALITY', nationality)
  }

  updateCountryOfBirth(prisonerNumber: string, countryOfBirth: string): Promise<void> {
    return this.updateCorePersonRecord(prisonerNumber, 'COUNTRY_OF_BIRTH', countryOfBirth)
  }

  updateReligion(prisonerNumber: string, religionCode: string, reasonForChange?: string): Promise<void> {
    return this.restClient.put({
      path: '/v1/person-protected-characteristics/religion',
      query: { prisonerNumber },
      data: { religionCode, reasonForChange },
    })
  }

  getReferenceDataCodes(domain: ProxyReferenceDataDomain): Promise<ReferenceDataCodeDto[]> {
    return this.restClient.get({ path: `/v1/core-person-record/reference-data/domain/${domain}/codes` })
  }

  getMilitaryRecords(prisonerNumber: string): Promise<MilitaryRecord[]> {
    return this.restClient.get({ path: `/v1/core-person-record/military-records`, query: { prisonerNumber } })
  }

  private updateCorePersonRecord(prisonerNumber: string, fieldName: string, value: string): Promise<void> {
    return this.restClient.patch({
      path: '/v1/core-person-record',
      query: { prisonerNumber },
      data: { fieldName, value },
    })
  }
}
