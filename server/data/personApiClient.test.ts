import nock from 'nock'
import config from '../config'
import { mockPersonRecord, mockPersonRecordWithReligionHistory } from './localMockData/personApi/personRecordMock'
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

  it('should call regular record endpoint when religion history is not needed', async () => {
    fakePersonApi
      .get(`/person/prison/${encodeURIComponent(prisonerNumber)}`)
      .matchHeader('authorization', `Bearer ${token}`)
      .reply(200, mockPersonRecord)
    await expect(personApiClient.getRecord(prisonerNumber)).resolves.toEqual(mockPersonRecord)
  })

  it('should call DPS record endpoint when religion history is needed', async () => {
    fakePersonApi
      .get(`/person/prison/dps/${encodeURIComponent(prisonerNumber)}`)
      .matchHeader('authorization', `Bearer ${token}`)
      .reply(200, mockPersonRecordWithReligionHistory)
    await expect(personApiClient.getRecord(prisonerNumber, true)).resolves.toEqual(mockPersonRecordWithReligionHistory)
  })
})
