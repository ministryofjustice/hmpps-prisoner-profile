import { RestClientBuilder } from '../../data'
import { ReferenceDataSource } from './referenceDataSource'
import { ReferenceDataCodeDto, ReferenceDataDomain } from '../../data/interfaces/referenceData'
import {
  HealthAndMedicationApiClient,
  HealthAndMedicationReferenceDataDomain,
} from '../../data/interfaces/healthAndMedicationApi/healthAndMedicationApiClient'

/**
 * Sources reference data from `hmpps-health-and-medication-api`.
 */
export default class HealthAndMedicationApiReferenceDataSource implements ReferenceDataSource {
  constructor(private readonly healthAndMedicationApiClientBuilder: RestClientBuilder<HealthAndMedicationApiClient>) {}

  async getReferenceDataCodes(domain: ReferenceDataDomain, token: string): Promise<ReferenceDataCodeDto[]> {
    const healthAndMedicationReferenceDataCodes = await this.healthAndMedicationApiClientBuilder(
      token,
    ).getReferenceDataCodes(domain as HealthAndMedicationReferenceDataDomain, true)

    return healthAndMedicationReferenceDataCodes.map(code => ({
      id: code.id,
      code: code.code,
      description: code.description,
      listSequence: code.listSequence,
      isActive: code.isActive,
    }))
  }
}
