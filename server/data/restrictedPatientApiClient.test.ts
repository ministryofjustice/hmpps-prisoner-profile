import nock from 'nock'
import config from '../config'
import RestrictedPatientApiRestClient from './restrictedPatientApiClient'
import { restrictedPatientMock } from './localMockData/restrictedPatientApi/restrictedPatient'

const token = { access_token: 'token-1', expires_in: 300 }

describe('restrictedPatientApiClient', () => {
  let fakeRestrictedPatientApi: nock.Scope
  let restrictedPatientApiClient: RestrictedPatientApiRestClient

  beforeEach(() => {
    fakeRestrictedPatientApi = nock(config.apis.restrictedPatientApi.url)
    restrictedPatientApiClient = new RestrictedPatientApiRestClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getRestrictedPatient', () => {
    it('should return data from api', async () => {
      fakeRestrictedPatientApi
        .get('/restricted-patient/prison-number/A8469DY')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, restrictedPatientMock)

      const output = await restrictedPatientApiClient.getRestrictedPatient('A8469DY')
      expect(output).toEqual(restrictedPatientMock)
    })
  })
})
