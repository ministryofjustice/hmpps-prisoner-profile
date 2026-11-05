import type { RestClientBuilder } from '../../data'
import type { PersonApiClient } from '../../data/interfaces/personApi'
import { CorePersonRecordReferenceDataDomain } from '../../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import type { ReferenceDataCodeDto, ReferenceDataDomain } from '../../data/interfaces/referenceData'
import type { ReferenceDataSource } from './referenceDataSource'

/**
 * Sources reference data from `hmpps-person-record`.
 */
// eslint-disable-next-line import/prefer-default-export
export class PersonApiReferenceDataSource implements ReferenceDataSource {
  constructor(private readonly personApiClientBuilder: RestClientBuilder<PersonApiClient>) {}

  async getReferenceDataCodes(domain: ReferenceDataDomain, token: string): Promise<ReferenceDataCodeDto[]> {
    if (domain !== CorePersonRecordReferenceDataDomain.religion) {
      throw new Error(
        `Person API client only supports ${CorePersonRecordReferenceDataDomain.religion} data code so far`,
      )
    }

    const personApiClient = this.personApiClientBuilder(token)
    const religionCodes = await personApiClient.getReligionCodes(false)
    return religionCodes.map(({ code, description, active }) => ({
      id: `${CorePersonRecordReferenceDataDomain.religion}_${code}`,
      code,
      description,
      listSequence: 99,
      isActive: active,
    }))
  }
}
