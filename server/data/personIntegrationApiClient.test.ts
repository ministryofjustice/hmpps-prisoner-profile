import nock from 'nock'
import config from '../config'
import PersonIntegrationApiRestClient from './personIntegrationApiClient'

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
})
