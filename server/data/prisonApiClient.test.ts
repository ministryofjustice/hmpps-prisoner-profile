import nock from 'nock'
import config from '../config'
import { CaseLoadsDummyDataA } from './localMockData/caseLoad'
import { LocationDummyDataC } from './localMockData/locations'
import nonAssociationDetailsDummyData from './localMockData/nonAssociations'
import PrisonApiClient from './prisonApiClient'

jest.mock('./tokenStore')

const token = { access_token: 'token-1', expires_in: 300 }

describe('prisonApiClient', () => {
  let fakePrisonApi: nock.Scope
  let prisonApiClient: PrisonApiClient

  beforeEach(() => {
    fakePrisonApi = nock(config.apis.prisonApi.url)
    prisonApiClient = new PrisonApiClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getUserLocations', () => {
    it('should return data from api', async () => {
      fakePrisonApi
        .get('/api/users/me/locations')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, LocationDummyDataC)

      const output = await prisonApiClient.getUserLocations()
      expect(output).toEqual(LocationDummyDataC)
    })
  })

  describe('getCaseLoads', () => {
    it('should return data from api', async () => {
      fakePrisonApi
        .get('/api/users/me/caseLoads?allCaseloads=true')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, CaseLoadsDummyDataA)

      const output = await prisonApiClient.getUserCaseLoads()
      expect(output).toEqual(CaseLoadsDummyDataA)
    })
  })

  describe('getNonAssociations', () => {
    it.each(['ABC12', 'DEF456'])('Should return data from the API', async prisonerNumber => {
      fakePrisonApi
        .get(`/api/offenders/${prisonerNumber}/non-association-details`)
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, nonAssociationDetailsDummyData)

      const output = await prisonApiClient.getNonAssociationDetails(prisonerNumber)
      expect(output).toEqual(nonAssociationDetailsDummyData)
    })
  })
})
