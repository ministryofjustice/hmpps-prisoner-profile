import { ReferenceDataDomain } from '../../data/interfaces/referenceData'
import { ReferenceDataSource } from './referenceDataSource'
import { RestClientBuilder } from '../../data'
import {
  CorePersonRecordReferenceDataDomain,
  PersonIntegrationApiClient,
} from '../../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import PersonIntegrationApiReferenceDataSource from './personIntegrationApiReferenceDataSource'
import HealthAndMedicationApiReferenceDataSource from './healthAndMedicationApiReferenceDataSource'
import {
  HealthAndMedicationApiClient,
  HealthAndMedicationReferenceDataDomain,
} from '../../data/interfaces/healthAndMedicationApi/healthAndMedicationApiClient'

export class ReferenceDataSourceFactory {
  private readonly referenceDataSources = new Map<ReferenceDataDomain, ReferenceDataSource>()

  constructor(
    personIntegrationApiClientBuilder: RestClientBuilder<PersonIntegrationApiClient>,
    healthAndMedicationApiClientBuilder: RestClientBuilder<HealthAndMedicationApiClient>,
  ) {
    const personIntegrationSource = new PersonIntegrationApiReferenceDataSource(personIntegrationApiClientBuilder)
    const healthAndMedicationSource = new HealthAndMedicationApiReferenceDataSource(healthAndMedicationApiClientBuilder)

    Object.values(CorePersonRecordReferenceDataDomain).forEach(domain => {
      this.referenceDataSources.set(domain, personIntegrationSource)
    })

    Object.values(HealthAndMedicationReferenceDataDomain).forEach(domain => {
      this.referenceDataSources.set(domain, healthAndMedicationSource)
    })
  }

  getReferenceDataSourceFor(domain: ReferenceDataDomain): ReferenceDataSource {
    return this.referenceDataSources.get(domain)
  }
}
