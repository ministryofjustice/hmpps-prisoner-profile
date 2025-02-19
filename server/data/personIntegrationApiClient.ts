import RestClient from './restClient'
import {
  CorePersonRecordReferenceDataCodeDto,
  CorePersonRecordReferenceDataDomain,
  MilitaryRecord,
  PersonIntegrationApiClient,
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

  updateNationality(prisonerNumber: string, nationality: string, otherNationalities: string): Promise<void> {
    return this.restClient.put({
      path: '/v1/core-person-record/nationality',
      query: { prisonerNumber },
      data: { nationality, otherNationalities },
    })
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

  getReferenceDataCodes(domain: CorePersonRecordReferenceDataDomain): Promise<CorePersonRecordReferenceDataCodeDto[]> {
    return this.restClient.get({ path: `/v1/core-person-record/reference-data/domain/${domain}/codes` })
  }

  getMilitaryRecords(prisonerNumber: string): Promise<MilitaryRecord[]> {
    return this.restClient.get({ path: `/v1/core-person-record/military-records`, query: { prisonerNumber } })
  }

  updateMilitaryRecord(prisonerNumber: string, militarySeq: number, militaryRecord: MilitaryRecord): Promise<void> {
    return this.restClient.put({
      path: '/v1/core-person-record/military-records',
      query: { prisonerNumber, militarySeq },
      data: militaryRecord,
    })
  }

  createMilitaryRecord(prisonerNumber: string, militaryRecord: MilitaryRecord): Promise<void> {
    return this.restClient.post({
      path: '/v1/core-person-record/military-records',
      query: { prisonerNumber },
      data: militaryRecord,
    })
  }

  private updateCorePersonRecord(prisonerNumber: string, fieldName: string, value: string): Promise<void> {
    return this.restClient.patch({
      path: '/v1/core-person-record',
      query: { prisonerNumber },
      data: { fieldName, value },
    })
  }
}
