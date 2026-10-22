import nock from 'nock'
import config from '../config'
import { ActivitiesApiClient } from './interfaces/activitiesApi/activitiesApiClient'
import ActivitiesApiRestClient from './activitiesApiClient'

const token = { access_token: 'token-1', expires_in: 300 }

describe('activitiesApiClient', () => {
  let fakeActivitiesApi: nock.Scope
  let activitiesApiClient: ActivitiesApiClient

  beforeEach(() => {
    fakeActivitiesApi = nock(config.apis.activitiesApi.url)
    activitiesApiClient = new ActivitiesApiRestClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getAttendanceSummary', () => {
    it('Should return data from the API', async () => {
      const summary = { acceptableAbsence: 1, unacceptableAbsence: 2, total: 5 }
      fakeActivitiesApi
        .get('/attendances/prisoner/A1234BC/attendance-summary')
        .query({ startDate: '2024-01-01', endDate: '2024-06-30' })
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, summary)

      const output = await activitiesApiClient.getAttendanceSummary('A1234BC', '2024-01-01', '2024-06-30')

      expect(output).toEqual(summary)
    })
  })
})
