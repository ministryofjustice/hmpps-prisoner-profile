import { RestClientBuilder } from '../data'
import MetricsService from './metrics/metricsService'
import ReferenceDataService from './referenceData/referenceDataService'
import { ReferenceDataCodeDto } from '../data/interfaces/referenceData'
import {
  LanguagePreferencesRequest,
  PersonCommunicationNeedsApiClient,
  PersonCommunicationNeedsReferenceDataDomain,
  SecondaryLanguageRequest,
} from '../data/interfaces/personCommunicationNeedsApi/personCommunicationNeedsApiClient'
import { PrisonUser } from '../interfaces/HmppsUser'

export default class LanguagesService {
  constructor(
    private readonly personCommunicationNeedsApiClientBuilder: RestClientBuilder<PersonCommunicationNeedsApiClient>,
    private readonly referenceDataService: ReferenceDataService,
    private readonly metricsService: MetricsService,
  ) {}

  async getCommunicationNeeds(clientToken: string, prisonerNumber: string) {
    const personCommunicationNeedsApi = this.personCommunicationNeedsApiClientBuilder(clientToken)
    return personCommunicationNeedsApi.getCommunicationNeeds(prisonerNumber)
  }

  async getReferenceData(
    clientToken: string,
    domains: PersonCommunicationNeedsReferenceDataDomain[],
  ): Promise<Record<string, ReferenceDataCodeDto[]>> {
    return Object.fromEntries(
      await Promise.all(
        domains.map(async domain => [
          Object.entries(PersonCommunicationNeedsReferenceDataDomain).find(([_, value]) => value === domain)?.[0] ??
            domain, // Get enum key name
          await this.referenceDataService.getActiveReferenceDataCodes(domain, clientToken),
        ]),
      ),
    )
  }

  async updateMainLanguage(
    clientToken: string,
    user: PrisonUser,
    prisonerNumber: string,
    languagePreferencesRequest: LanguagePreferencesRequest,
  ) {
    const personCommunicationNeedsApiClient = this.personCommunicationNeedsApiClientBuilder(clientToken)

    await personCommunicationNeedsApiClient.updateLanguagePreferences(prisonerNumber, languagePreferencesRequest)

    this.metricsService.trackPersonCommunicationNeedsUpdate({
      fieldsUpdated: ['language-preferences'],
      prisonerNumber,
      user,
    })
  }

  async updateOtherLanguage(
    clientToken: string,
    user: PrisonUser,
    prisonerNumber: string,
    secondaryLanguageRequest: SecondaryLanguageRequest,
  ) {
    const personCommunicationNeedsApiClient = this.personCommunicationNeedsApiClientBuilder(clientToken)

    await personCommunicationNeedsApiClient.updateSecondaryLanguage(prisonerNumber, secondaryLanguageRequest)

    this.metricsService.trackPersonCommunicationNeedsUpdate({
      fieldsUpdated: ['secondary-language'],
      prisonerNumber,
      user,
    })
  }

  async deleteOtherLanguage(clientToken: string, user: PrisonUser, prisonerNumber: string, languageCode: string) {
    const personCommunicationNeedsApiClient = this.personCommunicationNeedsApiClientBuilder(clientToken)

    await personCommunicationNeedsApiClient.deleteSecondaryLanguage(prisonerNumber, languageCode)

    this.metricsService.trackPersonCommunicationNeedsUpdate({
      fieldsUpdated: ['secondary-language'],
      prisonerNumber,
      user,
    })
  }
}
