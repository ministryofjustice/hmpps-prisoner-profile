import nock from 'nock'
import config from '../config'
import ManageUsersApiRestClient from './manageUsersApiClient'
import { ManageUsersApiClient } from './interfaces/manageUsersApi/manageUsersApiClient'

jest.mock('./tokenStore')

const token = { access_token: 'token-1', expires_in: 300 }

describe('manageUsersApiClient', () => {
  let fakeManageUsersApi: nock.Scope
  let manageUsersApiClient: ManageUsersApiClient

  beforeEach(() => {
    fakeManageUsersApi = nock(config.apis.manageUsersApi.url)
    manageUsersApiClient = new ManageUsersApiRestClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  const mockSuccessfulApiCall = <TReturnData>(url: string, returnData: TReturnData) => {
    fakeManageUsersApi.get(url).matchHeader('authorization', `Bearer ${token.access_token}`).reply(200, returnData)
  }

  describe('getUserEmail', () => {
    it('Should return data from the API', async () => {
      const username = 'USER123'
      mockSuccessfulApiCall(`/users/${username}/email`, { email: 'a@b.com' })

      const output = await manageUsersApiClient.getUserEmail(username)
      expect(output).toEqual({ email: 'a@b.com' })
    })
  })
})
