import nock from 'nock'
import config from '../config'
import XRayBodyScansApiClient from './xRayBodyScansApiClient'
import { mockScanResponse, mockLegacyScanResponse, mockScanSummaryResponse } from './localMockData/xRayBodyScansMock'

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

  describe('getScanSummary', () => {
    const scanSummaryResponseMock = mockScanSummaryResponse({
      prisonerNumber: samplePrisonerNumber,
      nomisCount: 4,
      dpsCount: 6,
      positiveCount: 3,
      negativeCount: 2,
      inconclusiveCount: 1,
    })

    it.each([
      { scenario: 'no latest scan', includeLatestScan: false, latestScan: null },
      {
        scenario: 'latest scan from DPS',
        includeLatestScan: true,
        latestScan: {
          ...mockScanResponse(samplePrisonerNumber),
          scanDate: '2026-07-23',
          mergedAt: null,
          createdAt: '2026-07-24T12:07:41',
          lastModifiedAt: '2026-07-24T11:07:41Z',
        },
      },
      {
        scenario: 'latest scan from NOMIS',
        includeLatestScan: true,
        latestScan: {
          ...mockLegacyScanResponse(samplePrisonerNumber),
          scanDate: '2026-07-23',
        },
      },
    ])('should return data from api with $scenario', async ({ includeLatestScan, latestScan }) => {
      fakeXRayBodyScansApi
        .get(`/prisoner/${samplePrisonerNumber}/scan/summary`)
        .query({ includeLatestScan })
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, {
          ...scanSummaryResponseMock,
          latestScan,
          fromScanDate: '2026-01-01',
          toScanDate: '2026-07-25',
        })

      const response = await xRayBodyScansApiClient.getScanSummary(samplePrisonerNumber, { includeLatestScan })

      const fromScanDate = new Date(2026, 0, 1, 12)
      const toScanDate = new Date(2026, 6, 25, 12)
      expect(response).toEqual({
        ...scanSummaryResponseMock,
        fromScanDate,
        toScanDate,
        latestScan: includeLatestScan
          ? expect.objectContaining({
              scanDate: new Date(2026, 6, 23, 12),
            })
          : null,
      })
    })
  })
})
