import nock from 'nock'
import config from '../config'
import XRayBodyScansApiClient from './xRayBodyScansApiClient'
import { mockScanSummaryResponse } from './localMockData/xRayBodyScansMock'

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

  it('getScanSummary should return data from api', async () => {
    const scanSummaryResponseMock = mockScanSummaryResponse({
      prisonerNumber: 'G6123VU',
      nomisCount: 4,
      dpsCount: 2,
      positiveCount: 1,
      negativeCount: 1,
      inconclusiveCount: 0,
    })

    fakeXRayBodyScansApi
      .get(`/prisoner/${samplePrisonerNumber}/scan/summary`)
      .matchHeader('authorization', `Bearer ${token.access_token}`)
      .reply(200, {
        ...scanSummaryResponseMock,
        fromScanDate: '2026-01-01',
        toScanDate: '2026-06-25',
      })

    const fromScanDate = new Date(2026, 0, 1, 12)
    const toScanDate = new Date(2026, 5, 25, 12)
    const response = await xRayBodyScansApiClient.getScanSummary(samplePrisonerNumber)
    expect(response).toEqual({
      ...scanSummaryResponseMock,
      fromScanDate,
      toScanDate,
    })
  })
})
