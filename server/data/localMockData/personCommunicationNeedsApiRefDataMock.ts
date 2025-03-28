import { ReferenceDataCodeDto } from '../interfaces/referenceData'
import { CommunicationNeedsDto } from '../interfaces/personCommunicationNeedsApi/personCommunicationNeedsApiClient'

export const LanguageRefDataMock: Record<string, ReferenceDataCodeDto[]> = {
  language: [
    {
      id: 'LANG_ENG',
      code: 'ENG',
      description: 'English',
      listSequence: 99,
      isActive: true,
    },
    {
      id: 'LANG_FRE',
      code: 'FRE',
      description: 'French',
      listSequence: 99,
      isActive: true,
    },
    {
      id: 'LANG_SPA',
      code: 'SPA',
      description: 'Spanish',
      listSequence: 99,
      isActive: true,
    },
  ],
}

export const CommunicationNeedsDtoMock: CommunicationNeedsDto = {
  prisonerNumber: 'A1234AA',
  languagePreferences: {
    preferredSpokenLanguage: { id: 'LANG_ENG', code: 'ENG', description: 'English' },
    preferredWrittenLanguage: { id: 'LANG_ENG', code: 'ENG', description: 'English' },
    interpreterRequired: false,
  },
  secondaryLanguages: [
    {
      language: { id: 'LANG_FRE', code: 'FRE', description: 'French' },
      canRead: true,
      canWrite: true,
      canSpeak: true,
    },
  ],
}
