import nock, { DataMatcherMap, RequestBodyMatcher } from 'nock'
import config from '../config'
import { WhereaboutsApiClient } from './interfaces/whereaboutsApi/whereaboutsApiClient'
import WhereaboutsRestApiClient from './whereaboutsClient'
import { appointmentMock, savedAppointmentMock } from './localMockData/appointmentMock'

const token = { access_token: 'token-1', expires_in: 300 }

describe('whereaboutsClient', () => {
  let fakeWhereaboutsApi: nock.Scope
  let whereaboutsApiClient: WhereaboutsApiClient

  beforeEach(() => {
    fakeWhereaboutsApi = nock(config.apis.whereaboutsApi.url)
    whereaboutsApiClient = new WhereaboutsRestApiClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const mockSuccessfulWhereaboutsGetApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    fakeWhereaboutsApi.get(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, returnData)
  }

  const mockSuccessfulWhereaboutsPostApiCall = <TReturnData>(
    url: string,
    body: RequestBodyMatcher,
    returnData: TReturnData,
  ) => {
    fakeWhereaboutsApi
      .post(url, body)
      .matchHeader('authorization', `Bearer ${token.access_token}`)
      .reply(200, returnData)
  }

  describe('getAppointment', () => {
    it('Should return data from the API', async () => {
      mockSuccessfulWhereaboutsGetApiCall('/appointment/1', appointmentMock)

      const output = await whereaboutsApiClient.getAppointment(1)
      expect(output).toEqual(appointmentMock)
    })
  })

  describe('createAppointments', () => {
    it('Should return data from the API', async () => {
      mockSuccessfulWhereaboutsPostApiCall(
        '/appointment',
        appointmentMock as unknown as DataMatcherMap,
        savedAppointmentMock,
      )

      const output = await whereaboutsApiClient.createAppointments(appointmentMock)
      expect(output).toEqual(savedAppointmentMock)
    })
  })
})
