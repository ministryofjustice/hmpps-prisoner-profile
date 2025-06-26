import RestClient from './restClient'
import config from '../config'
import {
  CommunicationNeedsDto,
  LanguagePreferencesRequest,
  PersonCommunicationNeedsApiClient,
  PersonCommunicationNeedsReferenceDataDomain,
  SecondaryLanguageRequest,
} from './interfaces/personCommunicationNeedsApi/personCommunicationNeedsApiClient'
import { ReferenceDataCode } from './interfaces/healthAndMedicationApi/healthAndMedicationApiClient'
import { handleNomisLockedError } from '../utils/nomisLockedErrorHelpers'

export default class PersonCommunicationNeedsApiRestClient implements PersonCommunicationNeedsApiClient {
  private readonly restClient: RestClient

  constructor(token: string) {
    this.restClient = new RestClient('Person Communication Needs API', config.apis.personCommunicationNeedsApi, token)
  }

  getReferenceDataCodes(domain: PersonCommunicationNeedsReferenceDataDomain): Promise<ReferenceDataCode[]> {
    return this.restClient.get({ path: `/v1/reference-data/domains/${domain}/codes` })
  }

  getCommunicationNeeds(prisonerNumber: string): Promise<CommunicationNeedsDto> {
    return this.restClient.get({ path: `/v1/prisoner/${prisonerNumber}/communication-needs` })
  }

  updateLanguagePreferences(
    prisonerNumber: string,
    languagePreferencesRequest: LanguagePreferencesRequest,
  ): Promise<void> {
    return handleNomisLockedError(() => this.restClient.put({
      path: `/v1/prisoner/${prisonerNumber}/language-preferences`,
      data: languagePreferencesRequest,
    }))
  }

  updateSecondaryLanguage(prisonerNumber: string, secondaryLanguageRequest: SecondaryLanguageRequest): Promise<void> {
    return handleNomisLockedError(() => this.restClient.put({
      path: `/v1/prisoner/${prisonerNumber}/secondary-language`,
      data: secondaryLanguageRequest,
    }))
  }

  deleteSecondaryLanguage(prisonerNumber: string, languageCode: string): Promise<void> {
    return handleNomisLockedError(() =>this.restClient.delete({ path: `/v1/prisoner/${prisonerNumber}/secondary-language/${languageCode}` }))
  }
}
