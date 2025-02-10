import nock from 'nock'
import config from '../config'
import PersonIntegrationApiRestClient from './personIntegrationApiClient'
import { CountryReferenceDataCodesMock, MilitaryRecordsMock } from './localMockData/personIntegrationReferenceDataMock'
import { ProxyReferenceDataDomain } from './interfaces/personIntegrationApi/personIntegrationApiClient'

const token = { access_token: 'token-1', expires_in: 300 }

describe('personIntegrationApiClient', () => {
  let fakePersonIntegrationApi: nock.Scope
  let personIntegrationApiClient: PersonIntegrationApiRestClient

  beforeEach(() => {
    fakePersonIntegrationApi = nock(config.apis.personIntegrationApi.url)
    personIntegrationApiClient = new PersonIntegrationApiRestClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('updateBirthPlace', () => {
    it('should update birth place', async () => {
      fakePersonIntegrationApi.patch('/v1/core-person-record?prisonerNumber=A1234AA').reply(204)
      await personIntegrationApiClient.updateBirthPlace('A1234AA', 'London')
    })
  })

  describe('updateCountryOfBirth', () => {
    it('should update country of birth', async () => {
      fakePersonIntegrationApi.patch('/v1/core-person-record?prisonerNumber=A1234AA').reply(204)
      await personIntegrationApiClient.updateCountryOfBirth('A1234AA', 'London')
    })
  })

  describe('updateNationality', () => {
    it('should update nationality', async () => {
      fakePersonIntegrationApi.put('/v1/core-person-record/nationality?prisonerNumber=A1234AA').reply(204)
      await personIntegrationApiClient.updateNationality('A1234AA', 'BRIT', 'Other nationality')
    })
  })

  describe('updateReligion', () => {
    it('should update religion', async () => {
      fakePersonIntegrationApi.put('/v1/person-protected-characteristics/religion?prisonerNumber=A1234AA').reply(204)
      await personIntegrationApiClient.updateReligion('A1234AA', 'ZORO', 'Some comment')
    })
  })

  describe('getReferenceDataCodes', () => {
    it('should return reference data codes', async () => {
      fakePersonIntegrationApi
        .get('/v1/core-person-record/reference-data/domain/COUNTRY/codes')
        .reply(200, CountryReferenceDataCodesMock)

      const output = await personIntegrationApiClient.getReferenceDataCodes(ProxyReferenceDataDomain.country)
      expect(output).toEqual(CountryReferenceDataCodesMock)
    })
  })

  describe('getMilitaryRecords', () => {
    it('should get military records from the API', async () => {
      fakePersonIntegrationApi
        .get('/v1/core-person-record/military-records?prisonerNumber=A1234AA')
        .reply(200, MilitaryRecordsMock)

      const result = await personIntegrationApiClient.getMilitaryRecords('A1234AA')
      expect(result).toEqual(MilitaryRecordsMock)
    })
  })

  describe('updateMilitaryRecord', () => {
    it('should update military record', async () => {
      fakePersonIntegrationApi
        .put('/v1/core-person-record/military-records?prisonerNumber=A1234AA&militarySeq=1')
        .reply(204)
      await personIntegrationApiClient.updateMilitaryRecord('A1234AA', 1, MilitaryRecordsMock[0])
    })
  })

  describe('createMilitaryRecord', () => {
    it('should create military record', async () => {
      fakePersonIntegrationApi.post('/v1/core-person-record/military-records?prisonerNumber=A1234AA').reply(201)
      await personIntegrationApiClient.createMilitaryRecord('A1234AA', MilitaryRecordsMock[0])
    })
  })
})
