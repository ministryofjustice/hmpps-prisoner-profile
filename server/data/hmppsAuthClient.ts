import { URLSearchParams } from 'url'
import superagent from 'superagent'

import logger from '../../logger'
import config from '../config'
import generateOauthClientToken from '../authentication/clientCredentials'
import TokenStore from './tokenStore/tokenStore'

const timeoutSpec = config.apis.hmppsAuth.timeout
const hmppsAuthUrl = config.apis.hmppsAuth.url

function getClientTokenFromHmppsAuth(
  clientId: string,
  clientSecret: string,
  username?: string,
): Promise<superagent.Response> {
  const clientToken = generateOauthClientToken(clientId, clientSecret)

  const grantRequest = new URLSearchParams({
    grant_type: 'client_credentials',
    ...(username && { username }),
  }).toString()

  logger.info(`HMPPS Auth request for client id '${clientId}': ${grantRequest}`)

  return superagent
    .post(`${hmppsAuthUrl}/oauth/token`)
    .set('Authorization', clientToken)
    .set('content-type', 'application/x-www-form-urlencoded')
    .send(grantRequest)
    .timeout(timeoutSpec)
}

function getSystemClientTokenFromHmppsAuth(username?: string): Promise<superagent.Response> {
  return getClientTokenFromHmppsAuth(
    config.apis.hmppsAuth.systemClientId,
    config.apis.hmppsAuth.systemClientSecret,
    username,
  )
}

function getCuriousClientTokenFromHmppsAuth(): Promise<superagent.Response> {
  return getClientTokenFromHmppsAuth(
    config.apis.hmppsAuth.systemClientIdCurious,
    config.apis.hmppsAuth.systemClientSecretCurious,
  )
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

// Wrapper to help typing enforce that the wrong token is not used for Curious API
export interface CuriousApiToken {
  curiousApiToken: string
}

export const curiousApiTokenBuilder = (tokenStore: TokenStore) => async (): Promise<CuriousApiToken> => {
  const key = 'CURIOUS_API'
  const curiousApiToken = await tokenStore.getToken(key)
  if (curiousApiToken) {
    return { curiousApiToken }
  }

  const newToken = await getCuriousClientTokenFromHmppsAuth()
  // set TTL slightly less than expiry of token. Async but no need to wait
  await tokenStore.setToken(key, newToken.body.access_token, newToken.body.expires_in - 60)

  return { curiousApiToken: newToken.body.access_token }
}
