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
import { handleNomisLockedError } from '../utils/nomisLockedError'

export default class PersonCommunicationNeedsApiRestClient
  extends RestClient
  implements PersonCommunicationNeedsApiClient
{
  constructor(token: string) {
    super('Person Communication Needs API', config.apis.personCommunicationNeedsApi, token)
  }

  getReferenceDataCodes(domain: PersonCommunicationNeedsReferenceDataDomain): Promise<ReferenceDataCode[]> {
    return this.get({ path: `/v1/reference-data/domains/${domain}/codes` }, this.token)
  }

  getCommunicationNeeds(prisonerNumber: string): Promise<CommunicationNeedsDto> {
    return this.get({ path: `/v1/prisoner/${prisonerNumber}/communication-needs` }, this.token)
  }

  updateLanguagePreferences(
    prisonerNumber: string,
    languagePreferencesRequest: LanguagePreferencesRequest,
  ): Promise<void> {
    return handleNomisLockedError(() =>
      this.put(
        {
          path: `/v1/prisoner/${prisonerNumber}/language-preferences`,
          data: languagePreferencesRequest,
        },
        this.token,
      ),
    )
  }

  updateSecondaryLanguage(prisonerNumber: string, secondaryLanguageRequest: SecondaryLanguageRequest): Promise<void> {
    return handleNomisLockedError(() =>
      this.put(
        {
          path: `/v1/prisoner/${prisonerNumber}/secondary-language`,
          data: secondaryLanguageRequest,
        },
        this.token,
      ),
    )
  }

  deleteSecondaryLanguage(prisonerNumber: string, languageCode: string): Promise<void> {
    return handleNomisLockedError(() =>
      this.delete({ path: `/v1/prisoner/${prisonerNumber}/secondary-language/${languageCode}` }, this.token),
    )
  }
}
