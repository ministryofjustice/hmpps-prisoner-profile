import superagent from 'superagent'
import { URLSearchParams } from 'url'

import type TokenStore from './tokenStore'
import logger from '../../logger'
import config from '../config'
import generateOauthClientToken from '../authentication/clientCredentials'
import RestClient from './restClient'
import { LocationDummyDataB } from './localMockData/locations'

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
}

export interface UserRole {
  roleCode: string
}

export default class HmppsAuthClient {
  constructor(private readonly tokenStore: TokenStore) {}

  private static restClient(token: string): RestClient {
    return new RestClient('HMPPS Auth Client', config.apis.hmppsAuth, token)
  }

  getOffender(token: string, offenderId: string): Promise<string[]> {
    return HmppsAuthClient.restClient(token).get({ path: `/api/prisoners/${offenderId}` }) as Promise<any>
  }

  getUserLocations(token: string): Promise<string[]> {
    return HmppsAuthClient.restClient(token)
      .get({ path: '/api/users/me/locations' })
      .catch(err => {
        if (config.localMockData === 'true') {
          return LocationDummyDataB
        }
        return err
      }) as Promise<any>
  }

  getUserCaseLoads(token: string): Promise<User> {
    logger.info(`Getting case loads details: calling HMPPS Auth`)
    return HmppsAuthClient.restClient(token).get({ path: '/global-search?size=1&page=1' }) as Promise<any>
  }

  getUserCaseNoteTypes(token: string): Promise<User> {
    logger.info(`Getting case note types details: calling HMPPS Auth`)
    return HmppsAuthClient.restClient(token).get({ path: '/casenotes/case-notes/types' }) as Promise<any>
  }

  postUserCaseNote(token: string): Promise<User> {
    logger.info(`Post case note type details: calling HMPPS Auth`)
    return HmppsAuthClient.restClient(token).post({
      path: '/casenotes/case-notes/abcdef/123',
      data: { test: 'test' },
    }) as Promise<any>
  }

  getUserCaseNote(token: string): Promise<User> {
    logger.info(`Get case note details: calling HMPPS Auth`)
    return HmppsAuthClient.restClient(token).get({ path: '/casenotes/case-notes/abcdef/123' }) as Promise<any>
  }

  getUser(token: string): Promise<User> {
    logger.info(`Getting user details: calling HMPPS Auth`)
    return HmppsAuthClient.restClient(token).get({ path: '/api/user/me' }) as Promise<User>
  }

  getUserRoles(token: string): Promise<string[]> {
    return HmppsAuthClient.restClient(token)
      .get({ path: '/api/user/me/roles' })
      .then(roles => (<UserRole[]>roles).map(role => role.roleCode))
  }

  async getSystemClientToken(username?: string): Promise<string> {
    const key = username || '%ANONYMOUS%'
    const token = await this.tokenStore.getToken(key)
    if (token) {
      return token
    }

    const newToken = await getSystemClientTokenFromHmppsAuth(username)
    // set TTL slightly less than expiry of token. Async but no need to wait
    await this.tokenStore.setToken(key, newToken.body.access_token, newToken.body.expires_in - 60)

    return newToken.body.access_token
  }
}

// TODO
// Get offender and populate first name and last name
// https://api-dev.prison.service.justice.gov.uk/swagger-ui/index.html?configUrl=/api/api-docs#/v1/getOffender
