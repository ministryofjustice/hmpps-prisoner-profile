import nock from 'nock'
import config from '../config'
import PrisonPersonApiRestClient from './prisonPersonApiClient'
import { PrisonPerson } from './interfaces/prisonPersonApi/prisonPersonApiClient'

const token = { access_token: 'token-1', expires_in: 300 }

describe('prisonPersonApiClient', () => {
  let fakePrisonerSearchApi: nock.Scope
  let prisonPersonApiClient: PrisonPersonApiRestClient

  beforeEach(() => {
    fakePrisonerSearchApi = nock(config.apis.prisonerSearchApi.url)
    prisonPersonApiClient = new PrisonPersonApiRestClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getPrisonPerson', () => {
    it('should return data from api', async () => {
      const prisonPerson: PrisonPerson = {
        prisonerNumber: 'A8469DY',
        physicalAttributes: { height: 100, weight: 100 },
        physicalCharacteristics: {
          hair: { code: 'BLONDE', description: 'Blonde' },
          facialHair: { code: 'MOUSTACHE', description: 'Moustache' },
          face: { code: 'OVAL', description: 'Oval' },
          build: { code: 'THIN', description: 'Thin' },
        },
      }
      fakePrisonerSearchApi
        .get('/prisoners/A8469DY')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, prisonPerson)

      const output = await prisonPersonApiClient.getPrisonPerson('A8469DY')
      expect(output).toEqual(prisonPerson)
    })
  })
})
