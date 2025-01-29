import nock from 'nock'
import config from '../config'
import HealthAndMedicationApiRestClient from './healthAndMedicationApiRestClient'
import { healthAndMedicationMock } from './localMockData/healthAndMedicationApi/healthAndMedicationMock'

const token = { access_token: 'token-1', expires_in: 300 }

describe('healthAndMedicationApiRestClient', () => {
  let fakeHealthAndMedicationApi: nock.Scope
  let healthAndMedicationApiClient: HealthAndMedicationApiRestClient

  beforeEach(() => {
    fakeHealthAndMedicationApi = nock(config.apis.healthAndMedicationApi.url)
    healthAndMedicationApiClient = new HealthAndMedicationApiRestClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getHealthAndMedication', () => {
    it('should return data from api', async () => {
      fakeHealthAndMedicationApi
        .get('/prisoners/A8469DY')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, healthAndMedicationMock)

      const output = await healthAndMedicationApiClient.getHealthAndMedicationForPrisoner('A8469DY')
      expect(output).toEqual(healthAndMedicationMock)
    })
  })
})
