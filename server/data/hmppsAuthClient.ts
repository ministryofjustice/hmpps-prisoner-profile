import superagent from 'superagent'
import { URLSearchParams } from 'url'

import type TokenStore from './tokenStore'
import logger from '../../logger'
import config from '../config'
import generateOauthClientToken from '../authentication/clientCredentials'
import RestClient from './restClient'
import { CaseLoad } from '../interfaces/caseLoad'

const timeoutSpec = config.apis.hmppsAuth.timeout
const hmppsAuthUrl = config.apis.hmppsAuth.url

function getSystemClientTokenFromHmppsAuth(username?: string): Promise<superagent.Response> {
  const clientToken = generateOauthClientToken(
    config.apis.hmppsAuth.systemClientId,
    config.apis.hmppsAuth.systemClientSecret,
  )

  const grantRequest = new URLSearchParams({
    grant_type: 'client_credentials',
    ...(username && { username }),
  }).toString()

  logger.info(`${grantRequest} HMPPS Auth request for client id '${config.apis.hmppsAuth.systemClientId}''`)

  return superagent
    .post(`${hmppsAuthUrl}/oauth/token`)
    .set('Authorization', clientToken)
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(grantRequest)
    .timeout(timeoutSpec)
}

export interface User {
  name: string
  activeCaseLoadId: string
  userRoles: string[]
  caseLoads: CaseLoad[]
}

export interface UserRole {
  roleCode: string
}

export default class HmppsAuthClient {
  constructor(private readonly restClient: RestClient) {}

  private static restClient(token: string): RestClient {
    return new RestClient('HMPPS Auth Client', config.apis.hmppsAuth, token)
  }

  getUser(): Promise<User> {
    logger.info(`Getting user details: calling HMPPS Auth`)
    return this.restClient.get({ path: '/api/user/me' }) as Promise<User>
  }

  getUserRoles(): Promise<string[]> {
    return this.restClient
      .get({ path: '/api/user/me/roles' })
      .then(roles => (<UserRole[]>roles).map(role => role.roleCode))
  }
}

export const systemTokenBuilder =
  (tokenStore: TokenStore) =>
  async (username?: string): Promise<string> => {
    const key = username || '%ANONYMOUS%'
    const token = await tokenStore.getToken(key)
    if (token) {
      return token
    }

    const newToken = await getSystemClientTokenFromHmppsAuth(username)
    // set TTL slightly less than expiry of token. Async but no need to wait
    await tokenStore.setToken(key, newToken.body.access_token, newToken.body.expires_in - 60)

    return newToken.body.access_token
  }
