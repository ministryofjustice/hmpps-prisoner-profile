import { ReferenceDataValue } from '../ReferenceDataValue'
import { ReferenceDataCode } from '../healthAndMedicationApi/healthAndMedicationApiClient'

// eslint-disable-next-line no-shadow
export enum PersonCommunicationNeedsReferenceDataDomain {
  language = 'LANG',
}

export interface LanguagePreferencesDto {
  preferredSpokenLanguage?: ReferenceDataValue
  preferredWrittenLanguage?: ReferenceDataValue
  interpreterRequired?: boolean
}

export interface SecondaryLanguageDto {
  language?: ReferenceDataValue
  canRead: boolean
  canWrite: boolean
  canSpeak: boolean
}

export interface CommunicationNeedsDto {
  prisonerNumber: string
  languagePreferences?: LanguagePreferencesDto
  secondaryLanguages: SecondaryLanguageDto[]
}

export interface LanguagePreferencesRequest {
  preferredSpokenLanguageCode?: string
  preferredWrittenLanguageCode?: string
  interpreterRequired: boolean
}

export interface SecondaryLanguageRequest {
  language: string
  canRead: boolean
  canWrite: boolean
  canSpeak: boolean
}

export interface PersonCommunicationNeedsApiClient {
  getCommunicationNeeds(prisonerNumber: string): Promise<CommunicationNeedsDto>

  updateLanguagePreferences(
    prisonerNumber: string,
    languagePreferencesRequest: LanguagePreferencesRequest,
  ): Promise<void>

  updateSecondaryLanguage(prisonerNumber: string, secondaryLanguageRequest: SecondaryLanguageRequest): Promise<void>

  deleteSecondaryLanguage(prisonerNumber: string, languageCode: string): Promise<void>

  getReferenceDataCodes(domain: PersonCommunicationNeedsReferenceDataDomain): Promise<ReferenceDataCode[]>
}
