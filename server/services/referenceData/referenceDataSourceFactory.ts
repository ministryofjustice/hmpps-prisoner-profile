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
import {
  PersonCommunicationNeedsApiClient,
  PersonCommunicationNeedsReferenceDataDomain,
} from '../../data/interfaces/personCommunicationNeedsApi/personCommunicationNeedsApiClient'
import PersonCommunicationNeedsApiReferenceDataSource from './personCommunicationNeedsApiReferenceDataSource'
import {
  PersonalRelationshipsApiClient,
  PersonalRelationshipsReferenceDataDomain,
} from '../../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'
import PersonalRelationshipsApiReferenceDataSource from './personalRelationshipsApiReferenceDataSource'

export class ReferenceDataSourceFactory {
  private readonly referenceDataSources = new Map<ReferenceDataDomain, ReferenceDataSource>()

  constructor(
    personIntegrationApiClientBuilder: RestClientBuilder<PersonIntegrationApiClient>,
    healthAndMedicationApiClientBuilder: RestClientBuilder<HealthAndMedicationApiClient>,
    personCommunicationNeedsApiClientBuilder: RestClientBuilder<PersonCommunicationNeedsApiClient>,
    personalRelationshipsApiClientBuilder: RestClientBuilder<PersonalRelationshipsApiClient>,
  ) {
    const personIntegrationSource = new PersonIntegrationApiReferenceDataSource(personIntegrationApiClientBuilder)
    const healthAndMedicationSource = new HealthAndMedicationApiReferenceDataSource(healthAndMedicationApiClientBuilder)
    const personCommunicationNeedsSource = new PersonCommunicationNeedsApiReferenceDataSource(
      personCommunicationNeedsApiClientBuilder,
    )
    const personalRelationshipsSource = new PersonalRelationshipsApiReferenceDataSource(
      personalRelationshipsApiClientBuilder,
    )

    Object.values(CorePersonRecordReferenceDataDomain).forEach(domain => {
      this.referenceDataSources.set(domain, personIntegrationSource)
    })

    Object.values(HealthAndMedicationReferenceDataDomain).forEach(domain => {
      this.referenceDataSources.set(domain, healthAndMedicationSource)
    })

    Object.values(PersonCommunicationNeedsReferenceDataDomain).forEach(domain => {
      this.referenceDataSources.set(domain, personCommunicationNeedsSource)
    })

    Object.values(PersonalRelationshipsReferenceDataDomain).forEach(domain => {
      this.referenceDataSources.set(domain, personalRelationshipsSource)
    })
  }

  getReferenceDataSourceFor(domain: ReferenceDataDomain): ReferenceDataSource {
    return this.referenceDataSources.get(domain)
  }
}
