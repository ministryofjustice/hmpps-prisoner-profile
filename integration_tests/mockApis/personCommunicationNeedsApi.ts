import { stubDeleteWithResponse, stubGetWithBody, stubPutWithResponse } from './utils'
import { SecondaryLanguageDto } from '../../server/data/interfaces/personCommunicationNeedsApi/personCommunicationNeedsApiClient'
import { ReferenceDataCodeDto } from '../../server/data/interfaces/referenceData'

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

  stubPersonCommunicationNeedsUpdateSecondaryLanguage: ({ prisonerNumber }: { prisonerNumber: string }) =>
    stubPutWithResponse<void>({
      path: `${baseUrl}/v1/prisoner/${prisonerNumber}/secondary-language`,
      responseBody: null,
    }),

  stubPersonCommunicationNeedsDeleteSecondaryLanguage: ({ prisonerNumber }: { prisonerNumber: string }) =>
    stubDeleteWithResponse<void>({
      path: `${baseUrl}/v1/prisoner/${prisonerNumber}/secondary-language/.*`,
      responseBody: null,
    }),

  stubPersonCommunicationNeedsGetReferenceData: ({
    domain,
    referenceData,
  }: {
    domain: string
    referenceData: ReferenceDataCodeDto[]
  }) =>
    stubGetWithBody({
      path: `${baseUrl}/v1/reference-data/domains/${domain}/codes`,
      body: referenceData,
    }),
}
