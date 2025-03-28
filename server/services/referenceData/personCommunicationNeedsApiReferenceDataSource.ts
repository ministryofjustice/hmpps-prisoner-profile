import { RestClientBuilder } from '../../data'
import { ReferenceDataSource } from './referenceDataSource'
import { ReferenceDataCodeDto, ReferenceDataDomain } from '../../data/interfaces/referenceData'
import {
  PersonCommunicationNeedsApiClient,
  PersonCommunicationNeedsReferenceDataDomain,
} from '../../data/interfaces/personCommunicationNeedsApi/personCommunicationNeedsApiClient'

/**
 * Sources reference data from `hmpps-person-communication-needs-api`.
 */
export default class PersonCommunicationNeedsApiReferenceDataSource implements ReferenceDataSource {
  constructor(
    private readonly personCommunicationNeedsApiClientBuilder: RestClientBuilder<PersonCommunicationNeedsApiClient>,
  ) {}

  async getReferenceDataCodes(domain: ReferenceDataDomain, token: string): Promise<ReferenceDataCodeDto[]> {
    const personCommunicationNeedsReferenceDataCodes = await this.personCommunicationNeedsApiClientBuilder(
      token,
    ).getReferenceDataCodes(domain as PersonCommunicationNeedsReferenceDataDomain)

    return personCommunicationNeedsReferenceDataCodes.map(code => ({
      id: code.id,
      code: code.code,
      description: code.description,
      listSequence: code.listSequence,
      isActive: code.isActive,
    }))
  }
}
