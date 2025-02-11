import { RestClientBuilder } from '../../data'
import {
  CorePersonRecordReferenceDataDomain,
  PersonIntegrationApiClient,
} from '../../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { ReferenceDataSource } from './referenceDataSource'
import { ReferenceDataCodeDto, ReferenceDataDomain } from '../../data/interfaces/referenceData'

/**
 * Sources reference data from `hmpps-person-integration-api`.
 */
export default class PersonIntegrationApiReferenceDataSource implements ReferenceDataSource {
  constructor(private readonly personIntegrationApiClientBuilder: RestClientBuilder<PersonIntegrationApiClient>) {}

  async getActiveReferenceDataCodes(domain: ReferenceDataDomain, token: string): Promise<ReferenceDataCodeDto[]> {
    const personIntegrationReferenceDataCodes = await this.personIntegrationApiClientBuilder(
      token,
    ).getReferenceDataCodes(domain as CorePersonRecordReferenceDataDomain)

    return personIntegrationReferenceDataCodes.map(code => ({
      id: code.id,
      code: code.code,
      description: code.description,
      listSequence: code.listSequence,
      isActive: code.isActive,
      parentCode: code.parentCode,
      parentDomain: code.parentDomain,
    }))
  }
}
