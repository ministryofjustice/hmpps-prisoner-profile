import nock from 'nock'
import config from '../config'
import { mockPersonRecord, mockReligionHistory } from './localMockData/personApi/personRecordMock'
import { personApiReligionCodesMock } from './localMockData/personApi/religionCodesMock'
import type { PersonApiClient } from './interfaces/personApi'
import PersonApiRestClient from './personApiClient'

const token = 'token-1'
const prisonerNumber = 'A1234BC'

describe('Person API REST Client', () => {
  const fakePersonApi = nock(config.apis.personApi.url)
  let personApiClient: PersonApiClient

  beforeEach(() => {
    personApiClient = new PersonApiRestClient(token)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  afterAll(() => {
    nock.restore()
  })

  it.each([
    {
      scenario: 'all religion codes',
      url: '/person/reference-data/religion-codes?active=false',
      callApi() {
        return personApiClient.getReligionCodes()
      },
      response: personApiReligionCodesMock,
    },
    {
      scenario: 'active religion codes',
      url: '/person/reference-data/religion-codes?active=true',
      callApi() {
        return personApiClient.getReligionCodes(true)
      },
      response: personApiReligionCodesMock,
    },
    {
      scenario: 'person record',
      url: `/person/prison/${prisonerNumber}`,
      callApi() {
        return personApiClient.getRecord(prisonerNumber)
      },
      response: mockPersonRecord,
    },
    {
      scenario: 'religion history',
      url: `/person/prison/${prisonerNumber}/religion-history`,
      callApi() {
        return personApiClient.getReligionHistory(prisonerNumber)
      },
      response: mockReligionHistory,
    },
  ])('should call $scenario endpoint and return data unchanged', async ({ url, callApi, response }) => {
    fakePersonApi.get(url).matchHeader('authorization', `Bearer ${token}`).reply(200, response)
    await expect(callApi()).resolves.toEqual(response)
  })
})
