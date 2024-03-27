import nock from 'nock'
import PrisonRegisterApiRestClient from './prisonRegisterApiClient'
import config from '../config'
import { allPrisons, prisonsKeyedByPrisonId } from './localMockData/prisonRegisterMockData'

describe('prisonRegisterClient', () => {
  const systemToken = 'a-system-token'
  const prisonRegisterClient = new PrisonRegisterApiRestClient(systemToken)

  config.apis.prisonRegisterApi.url = 'http://localhost:8200'
  let prisonRegisterApi: nock.Scope

  beforeEach(() => {
    prisonRegisterApi = nock(config.apis.prisonRegisterApi.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getAllPrisons', () => {
    it('should get all prisons', async () => {
      // Given
      prisonRegisterApi.get('/prisons').reply(200, allPrisons)

      // When
      const actual = await prisonRegisterClient.getAllPrisons()

      // Then
      expect(actual).toEqual(allPrisons)
      expect(nock.isDone()).toBe(true)
    })

    it('should not get all prisons given API returns an error response', async () => {
      // Given
      const expectedResponseBody = {
        status: 501,
        userMessage: 'An unexpected error occurred',
        developerMessage: 'An unexpected error occurred',
      }
      prisonRegisterApi.get('/prisons').reply(501, expectedResponseBody)

      // When
      try {
        await prisonRegisterClient.getAllPrisons()
      } catch (e) {
        // Then
        expect(nock.isDone()).toBe(true)
        expect(e.status).toEqual(501)
        expect(e.data).toEqual(expectedResponseBody)
      }
    })
  })

  describe('getPrisonByPrisonId', () => {
    it('should get prison by ID given prison exists', async () => {
      // Given
      const prisonId = 'MDI'
      const moorland = prisonsKeyedByPrisonId['MDI']
      prisonRegisterApi.get(`/prisons/id/${prisonId}`).reply(200, moorland)

      // When
      const actual = await prisonRegisterClient.getPrisonByPrisonId(prisonId)

      // Then
      expect(actual).toEqual(moorland)
      expect(nock.isDone()).toBe(true)
    })

    it('should not get prison by ID given prison does not exist', async () => {
      // Given
      const prisonId = 'unknown-prison-id'

      const expectedResponseBody = {
        status: 404,
        errorCode: null as string,
        userMessage: 'Prison not found exception',
        developerMessage: 'Prison unknown-prison-id not found',
        moreInfo: null as string,
      }
      prisonRegisterApi.get(`/prisons/id/${prisonId}`).reply(404, expectedResponseBody)

      // When
      try {
        await prisonRegisterClient.getPrisonByPrisonId(prisonId)
      } catch (e) {
        // Then
        expect(nock.isDone()).toBe(true)
        expect(e.status).toEqual(404)
        expect(e.data).toEqual(expectedResponseBody)
      }
    })

    it('should not get prison by ID given API returns an error response', async () => {
      // Given
      const prisonId = 'MDI'

      const expectedResponseBody = {
        status: 501,
        userMessage: 'An unexpected error occurred',
        developerMessage: 'An unexpected error occurred',
      }
      prisonRegisterApi.get(`/prisons/id/${prisonId}`).reply(501, expectedResponseBody)

      // When
      try {
        await prisonRegisterClient.getPrisonByPrisonId(prisonId)
      } catch (e) {
        // Then
        expect(nock.isDone()).toBe(true)
        expect(e.status).toEqual(501)
        expect(e.data).toEqual(expectedResponseBody)
      }
    })
  })
})
