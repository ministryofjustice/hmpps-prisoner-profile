import nock from 'nock'

import config from '../config'
import HmppsAuthClient, { systemTokenBuilder } from './hmppsAuthClient'
import TokenStore from './tokenStore'
import restClientBuilder from '.'

jest.mock('./tokenStore')

const tokenStore = new TokenStore(null) as jest.Mocked<TokenStore>

const username = 'Bob'
const token = { access_token: 'token-1', expires_in: 300 }

describe('hmppsAuthClient', () => {
  let fakeHmppsAuthApi: nock.Scope
  let systemToken: (u?: string) => Promise<string>

  beforeEach(() => {
    fakeHmppsAuthApi = nock(config.apis.hmppsAuth.url)
    systemToken = systemTokenBuilder(tokenStore)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  describe('getUser', () => {
    it('should return data from api', async () => {
      const response = { data: 'data' }

      fakeHmppsAuthApi
        .get('/api/user/me')
        .matchHeader('authorization', `Bearer ${token.access_token}`)
        .reply(200, response)

      const hmppsAuthClient = restClientBuilder(
        'HMPPS Auth Client',
        config.apis.hmppsAuth,
        HmppsAuthClient,
      )(token.access_token)

      const output = await hmppsAuthClient.getUser()
      expect(output).toEqual(response)
    })
  })

  describe('getSystemClientToken', () => {
    it('should instantiate the redis client', async () => {
      tokenStore.getToken.mockResolvedValue(token.access_token)
      await systemToken(username)
    })

    it('should return token from redis if one exists', async () => {
      tokenStore.getToken.mockResolvedValue(token.access_token)
      const output = await systemToken(username)
      expect(output).toEqual(token.access_token)
    })

    it('should return token from HMPPS Auth with username', async () => {
      tokenStore.getToken.mockResolvedValue(null)

      fakeHmppsAuthApi
        .post(`/oauth/token`, 'grant_type=client_credentials&username=Bob')
        .basicAuth({ user: config.apis.hmppsAuth.systemClientId, pass: config.apis.hmppsAuth.systemClientSecret })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, token)

      const output = await systemToken(username)

      expect(output).toEqual(token.access_token)
      expect(tokenStore.setToken).toBeCalledWith('Bob', token.access_token, 240)
    })

    it('should return token from HMPPS Auth without username', async () => {
      tokenStore.getToken.mockResolvedValue(null)

      fakeHmppsAuthApi
        .post(`/oauth/token`, 'grant_type=client_credentials')
        .basicAuth({ user: config.apis.hmppsAuth.systemClientId, pass: config.apis.hmppsAuth.systemClientSecret })
        .matchHeader('Content-Type', 'application/x-www-form-urlencoded')
        .reply(200, token)

      const output = await systemToken()

      expect(output).toEqual(token.access_token)
      expect(tokenStore.setToken).toBeCalledWith('%ANONYMOUS%', token.access_token, 240)
    })
  })
})
