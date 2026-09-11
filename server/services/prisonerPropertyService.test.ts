import PrisonerPropertyService, { ACTIVE_AGENCIES_TTL_MS } from './prisonerPropertyService'
import type { PrisonerPropertyApiClient } from '../data/interfaces/prisonerPropertyApi'
import { propertySummaryMock } from '../data/localMockData/prisonerPropertySummaryMock'

describe('prisonerPropertyService', () => {
  const token = 'token'
  let apiClient: PrisonerPropertyApiClient
  let service: PrisonerPropertyService

  beforeEach(() => {
    apiClient = {
      getActiveAgencyIds: jest.fn(async () => ['IWI', 'MDI']),
      getPrisonerPropertySummary: jest.fn(async () => propertySummaryMock),
    }
    service = new PrisonerPropertyService(() => apiClient)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  describe('isPrisonActive', () => {
    it('is true for a prison the property service is switched on for', async () => {
      expect(await service.isPrisonActive(token, 'IWI')).toEqual(true)
    })

    it('is false for a prison it is not switched on for', async () => {
      expect(await service.isPrisonActive(token, 'LEI')).toEqual(false)
    })

    it('is false for a missing prison id, without calling the api', async () => {
      expect(await service.isPrisonActive(token, undefined)).toEqual(false)
      expect(apiClient.getActiveAgencyIds).not.toHaveBeenCalled()
    })

    it('caches the active agencies rather than calling the api each time', async () => {
      await service.isPrisonActive(token, 'IWI')
      await service.isPrisonActive(token, 'MDI')

      expect(apiClient.getActiveAgencyIds).toHaveBeenCalledTimes(1)
    })

    it('refreshes the active agencies once the cache has expired', async () => {
      jest.useFakeTimers()
      await service.isPrisonActive(token, 'IWI')

      jest.advanceTimersByTime(ACTIVE_AGENCIES_TTL_MS + 1)
      await service.isPrisonActive(token, 'IWI')

      expect(apiClient.getActiveAgencyIds).toHaveBeenCalledTimes(2)
    })

    it('is false when the api fails and nothing has been cached', async () => {
      apiClient.getActiveAgencyIds = jest.fn(async () => {
        throw new Error('unavailable')
      })

      expect(await service.isPrisonActive(token, 'IWI')).toEqual(false)
    })

    it('falls back to the last known agencies when a refresh fails', async () => {
      jest.useFakeTimers()
      await service.isPrisonActive(token, 'IWI')

      apiClient.getActiveAgencyIds = jest.fn(async () => {
        throw new Error('unavailable')
      })
      jest.advanceTimersByTime(ACTIVE_AGENCIES_TTL_MS + 1)

      expect(await service.isPrisonActive(token, 'IWI')).toEqual(true)
    })
  })

  describe('getPropertySummary', () => {
    it('returns the summary from the api', async () => {
      expect(await service.getPropertySummary(token, 'G6123VU')).toEqual(propertySummaryMock)
    })

    it('returns null when the api fails, so the page can fall back to the existing card', async () => {
      apiClient.getPrisonerPropertySummary = jest.fn(async () => {
        throw new Error('unavailable')
      })

      expect(await service.getPropertySummary(token, 'G6123VU')).toEqual(null)
    })
  })
})
