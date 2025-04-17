import nock from 'nock'
import config from '../config'
import PersonCommunicationNeedsApiRestClient from './personCommunicationNeedsApiRestClient'
import {
  CommunicationNeedsDto,
  LanguagePreferencesRequest,
  PersonCommunicationNeedsReferenceDataDomain,
  SecondaryLanguageRequest,
} from './interfaces/personCommunicationNeedsApi/personCommunicationNeedsApiClient'
import { LanguageRefDataMock } from './localMockData/personCommunicationNeedsApiRefDataMock'

const token = { access_token: 'token-1', expires_in: 300 }

describe('personCommunicationNeedsApiRestClient', () => {
  let fakePersonCommunicationNeedsApi: nock.Scope
  let personCommunicationNeedsApiClient: PersonCommunicationNeedsApiRestClient

  beforeEach(() => {
    fakePersonCommunicationNeedsApi = nock(config.apis.personCommunicationNeedsApi.url)
    personCommunicationNeedsApiClient = new PersonCommunicationNeedsApiRestClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const prisonerNumber = 'A1234BC'

  const communicationNeeds: CommunicationNeedsDto = {
    prisonerNumber,
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

  describe('getCommunicationNeeds', () => {
    it('should return data from api', async () => {
      fakePersonCommunicationNeedsApi
        .get(`/v1/prisoner/${prisonerNumber}/communication-needs`)
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, communicationNeeds)

      const output = await personCommunicationNeedsApiClient.getCommunicationNeeds(prisonerNumber)
      expect(output).toEqual(communicationNeeds)
    })
  })

  describe('updateLanguagePreferences', () => {
    it('should call the api with the correct data', async () => {
      const languagePreferencesRequest: LanguagePreferencesRequest = {
        preferredSpokenLanguageCode: 'ENG',
        preferredWrittenLanguageCode: 'ENG',
        interpreterRequired: false,
      }

      fakePersonCommunicationNeedsApi
        .put(`/v1/prisoner/${prisonerNumber}/language-preferences`)
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200)

      await personCommunicationNeedsApiClient.updateLanguagePreferences(prisonerNumber, languagePreferencesRequest)
      expect(fakePersonCommunicationNeedsApi.isDone()).toBe(true)
    })
  })

  describe('updateSecondaryLanguage', () => {
    it('should call the api with the correct data', async () => {
      const secondaryLanguageRequest: SecondaryLanguageRequest = {
        language: 'FRE',
        canRead: true,
        canWrite: true,
        canSpeak: true,
      }

      fakePersonCommunicationNeedsApi
        .put(`/v1/prisoner/${prisonerNumber}/secondary-language`)
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200)

      await personCommunicationNeedsApiClient.updateSecondaryLanguage(prisonerNumber, secondaryLanguageRequest)
      expect(fakePersonCommunicationNeedsApi.isDone()).toBe(true)
    })
  })

  describe('deleteSecondaryLanguage', () => {
    it('should call the api with the correct data', async () => {
      const languageCode = 'FRE'

      fakePersonCommunicationNeedsApi
        .delete(`/v1/prisoner/${prisonerNumber}/secondary-language/${languageCode}`)
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200)

      await personCommunicationNeedsApiClient.deleteSecondaryLanguage(prisonerNumber, languageCode)
      expect(fakePersonCommunicationNeedsApi.isDone()).toBe(true)
    })
  })

  describe('getReferenceDataCodes', () => {
    it('should return reference data codes', async () => {
      fakePersonCommunicationNeedsApi.get('/v1/reference-data/domains/LANG/codes').reply(200, LanguageRefDataMock)

      const output = await personCommunicationNeedsApiClient.getReferenceDataCodes(
        PersonCommunicationNeedsReferenceDataDomain.language,
      )
      expect(output).toEqual(LanguageRefDataMock)
    })
  })
})
