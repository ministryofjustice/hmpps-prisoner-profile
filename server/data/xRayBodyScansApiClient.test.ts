import nock from 'nock'
import config from '../config'
import XRayBodyScansApiClient from './xRayBodyScansApiClient'
import { scanCountResponseMock } from './localMockData/xRayBodyScansMock'

const token = { access_token: 'token-1', expires_in: 300 }
const samplePrisonerNumber = 'G6123VU'

describe('xRayBodyScansApiClient', () => {
  let fakeXRayBodyScansApi: nock.Scope
  let xRayBodyScansApiClient: XRayBodyScansApiClient

  beforeEach(() => {
    fakeXRayBodyScansApi = nock(config.apis.xRayBodyScans.url)
    xRayBodyScansApiClient = new XRayBodyScansApiClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  it('countScans should return data from api', async () => {
    fakeXRayBodyScansApi
      .get(`/prisoner/${samplePrisonerNumber}/scan/count`)
      .query({
        fromStartDate: '2026-05-01',
        toStartDate: '2026-06-25',
      })
      .matchHeader('authorization', `Bearer ${token.access_token}`)
      .reply(200, scanCountResponseMock)

    const response = await xRayBodyScansApiClient.countScans({
      prisonerNumber: samplePrisonerNumber,
      fromStartDate: new Date(2026, 4, 1),
      toStartDate: new Date(2026, 5, 25),
    })
    expect(response).toEqual(scanCountResponseMock)
  })
})
