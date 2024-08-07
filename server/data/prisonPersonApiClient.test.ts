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
        physicalAttributes: {
          height: {
            value: 100,
            lastModifiedAt: '2024-07-01T01:02:03.456+0100',
            lastModifiedBy: 'USER1',
          },
          weight: {
            value: 100,
            lastModifiedAt: '2024-07-01T01:02:03.456+0100',
            lastModifiedBy: 'USER1',
          },
          hair: { id: 'BLONDE', description: 'Blonde' },
          facialHair: { id: 'MOUSTACHE', description: 'Moustache' },
          face: { id: 'OVAL', description: 'Oval' },
          build: { id: 'THIN', description: 'Thin' },
          leftEyeColour: { id: 'BLUE', description: 'Blue' },
          rightEyeColour: { id: 'GREEN', description: 'Green' },
          shoeSize: {
            value: '11',
            lastModifiedAt: '2024-07-01T01:02:03.456+0100',
            lastModifiedBy: 'USER1',
          },
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
