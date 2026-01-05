import nock from 'nock'
import config from '../config'
import type { SupportForAdditionalNeedsApiClient } from './interfaces/supportForAdditionalNeedsApi/supportForAdditionalNeedsApiClient'
import SupportForAdditionalNeedsApiRestClient from './supportForAdditionalNeedsApiRestClient'
import { prisonerHasNeedsMock } from './localMockData/supportForAdditionalNeedsMock'

const token = { access_token: 'token-1', expires_in: 300 }

describe('Support for additional needs API REST client', () => {
  let fakeSupportForAdditionalNeedsApi: nock.Scope
  let supportForAdditionalNeedsApiClient: SupportForAdditionalNeedsApiClient

  beforeEach(() => {
    fakeSupportForAdditionalNeedsApi = nock(config.apis.supportForAdditionalNeeds.url)
    supportForAdditionalNeedsApiClient = new SupportForAdditionalNeedsApiRestClient(token.access_token)
  })

  afterEach(() => {
    jest.resetAllMocks()
    nock.cleanAll()
  })

  it('should check prisoner’s additional needs with the API', async () => {
    fakeSupportForAdditionalNeedsApi
      .get('/profile/G6123VU/has-need')
      .matchHeader('authorization', `Bearer ${token.access_token}`)
      .reply(200, prisonerHasNeedsMock)

    const response = await supportForAdditionalNeedsApiClient.hasNeedsForAdditionalSupport('G6123VU')
    expect(response).toEqual(
      expect.objectContaining({
        hasNeed: true,
        url: expect.stringMatching('/profile/G6123VU/overview$'),
        modalUrl: expect.stringMatching('/profile/G6123VU/overview/modal$'),
      }),
    )
  })
})
