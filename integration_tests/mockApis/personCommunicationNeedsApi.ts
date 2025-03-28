import { stubGetWithBody, stubPutWithResponse } from './utils'
import { SecondaryLanguageDto } from '../../server/data/interfaces/personCommunicationNeedsApi/personCommunicationNeedsApiClient'
import { CorePersonRecordReferenceDataCodeDto } from '../../server/data/interfaces/personIntegrationApi/personIntegrationApiClient'

const baseUrl = '/communicationNeeds'

export default {
  stubPersonCommunicationNeedsGetCommunicationNeeds: ({
    prisonerNumber,
    languagePreferences = {
      preferredSpokenLanguage: { code: 'ENG', description: 'English' },
      preferredWrittenLanguage: { code: 'ENG', description: 'English' },
      interpreterRequired: false,
    },
    secondaryLanguages = [],
  }: {
    prisonerNumber: string
    languagePreferences?: {
      preferredSpokenLanguage?: { code: string; description: string }
      preferredWrittenLanguage?: { code: string; description: string }
      interpreterRequired?: boolean
    }
    secondaryLanguages?: SecondaryLanguageDto[]
  }) =>
    stubGetWithBody({
      path: `${baseUrl}/v1/prisoner/${prisonerNumber}/communication-needs`,
      body: {
        languagePreferences,
        secondaryLanguages,
      },
    }),

  stubPersonCommunicationNeedsUpdateLanguagePreferences: ({ prisonerNumber }: { prisonerNumber: string }) =>
    stubPutWithResponse<void>({
      path: `${baseUrl}/v1/prisoner/${prisonerNumber}/language-preferences`,
      responseBody: null,
    }),

  stubPersonCommunicationNeedsGetReferenceData: ({
    domain,
    referenceData,
  }: {
    domain: string
    referenceData: CorePersonRecordReferenceDataCodeDto[]
  }) =>
    stubGetWithBody({
      path: `${baseUrl}/v1/core-person-record/reference-data/domain/${domain}/codes`,
      body: referenceData,
    }),
}
