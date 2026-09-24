import nock from 'nock'
import config from '../config'
import { CellMovementsApiClient } from './interfaces/cellMovementsApi'
import CellMovementsApiRestClient from './cellMovementsApiClient'
import { CellMovementReasonMock } from './localMockData/cellMovementReasonMock'

const token = { access_token: 'token-1', expires_in: 300 }

describe('cellMovementsApiClient', () => {
  let fakeCellMovementsApi: nock.Scope
  let cellMovementsApiClient: CellMovementsApiClient

  beforeEach(() => {
    fakeCellMovementsApi = nock(config.apis.cellMovementsApi.url)
    cellMovementsApiClient = new CellMovementsApiRestClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getCellMovementReason', () => {
    it('Should return data from the API', async () => {
      fakeCellMovementsApi
        .get('/cell-movements/1234134/bed-assignment/10')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, CellMovementReasonMock)

      const output = await cellMovementsApiClient.getCellMovementReason(1234134, 10, true)
      expect(output).toEqual(CellMovementReasonMock)
    })

    it('Should return null on a 404 when asked to ignore it - the common nothing-recorded case', async () => {
      fakeCellMovementsApi
        .get('/cell-movements/1234134/bed-assignment/10')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(404, { status: 404 })

      const output = await cellMovementsApiClient.getCellMovementReason(1234134, 10, true)
      expect(output).toBeNull()
    })
  })
})
