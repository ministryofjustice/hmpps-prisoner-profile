import { RestClientBuilder } from '../../data'
import { ReferenceDataSource } from './referenceDataSource'
import { ReferenceDataCodeDto, ReferenceDataDomain } from '../../data/interfaces/referenceData'
import {
  PersonalRelationshipsApiClient,
  PersonalRelationshipsReferenceDataDomain,
} from '../../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'

/**
 * Sources reference data from `hmpps-personal-relationships-api`.
 */
export default class PersonalRelationshipsApiReferenceDataSource implements ReferenceDataSource {
  constructor(
    private readonly personalRelationshipsApiClientBuilder: RestClientBuilder<PersonalRelationshipsApiClient>,
  ) {}

  async getReferenceDataCodes(domain: ReferenceDataDomain, token: string): Promise<ReferenceDataCodeDto[]> {
    const personalRelationshipsReferenceCodes = await this.personalRelationshipsApiClientBuilder(
      token,
    ).getReferenceDataCodes(domain as PersonalRelationshipsReferenceDataDomain)

    return personalRelationshipsReferenceCodes.map(code => ({
      id: code.referenceCodeId?.toString(),
      code: code.code,
      description: code.description,
      listSequence: code.displayOrder,
      isActive: code.isActive,
    }))
  }
}
