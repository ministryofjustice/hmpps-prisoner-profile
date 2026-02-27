import { NextFunction, Request, Response } from 'express'
import getDuplicatePrisonerData from './getDuplicatePrisonerDataMiddleware'
import { Services } from '../services'
import { DataAccess } from '../data'
import MetricsService from '../services/metrics/metricsService'
import PersonApiRestClient from '../data/personApiClient'
import { PrisonerSearchClient } from '../data/interfaces/prisonerSearchApi/prisonerSearchClient'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { Role } from '../data/enums/role'
import { metricsServiceMock } from '../../tests/mocks/metricsServiceMock'
import * as featureFlags from '../utils/featureFlags'

jest.mock('../utils/featureFlags')

const createTestPrisoner = (prisonerNumber: string, prisonId: string, overrides?: Partial<Prisoner>): Prisoner => {
  return {
    prisonerNumber,
    firstName: 'John',
    lastName: 'Smith',
    prisonId,
    cellLocation: prisonId === 'OUT' || prisonId === 'TRN' ? 'INACTIVE' : '1-1-001',
    ...overrides,
  } as Prisoner
}

let req: Request
let res: Response
let next: NextFunction
let services: Services
let personApiClient: PersonApiRestClient
let prisonerSearchClient: PrisonerSearchClient
let metricsService: MetricsService

const mockUser = {
  authSource: 'nomis',
  userId: 'TEST_USER',
  username: 'testuser',
  userRoles: [Role.PrisonUser],
  activeCaseLoadId: 'MDI',
}

const mockPersonRecord = {
  identifiers: {
    prisonNumbers: ['A1234BC', 'B5678DE', 'C9012FG'],
  },
}

const mockPrisoners: Prisoner[] = [
  createTestPrisoner('A1234BC', 'MDI'),
  createTestPrisoner('B5678DE', 'OUT'),
  createTestPrisoner('C9012FG', 'TRN'),
]

describe('GetDuplicatePrisonerDataMiddleware', () => {
  beforeEach(() => {
    jest.resetAllMocks()
    jest.mocked(featureFlags).personDuplicateRecordsEnabled.mockReturnValue(true)

    req = {
      middleware: {
        clientToken: 'CLIENT_TOKEN',
      },
    } as unknown as Request

    res = {
      locals: {
        prisonerNumber: 'A1234BC',
        user: mockUser,
      },
    } as unknown as Response

    next = jest.fn()

    personApiClient = {
      getRecord: jest.fn(async () => mockPersonRecord),
    } as unknown as PersonApiRestClient

    prisonerSearchClient = {
      findByNumbers: jest.fn(async () => mockPrisoners),
    } as unknown as PrisonerSearchClient

    metricsService = metricsServiceMock()

    services = {
      dataAccess: {
        personApiClientBuilder: jest.fn(() => personApiClient),
        prisonerSearchApiClientBuilder: jest.fn(() => prisonerSearchClient),
      } as unknown as DataAccess,
      metricsService,
    } as unknown as Services
  })

  describe('Feature flag', () => {
    it('should set empty array and skip API calls when disabled', async () => {
      jest.mocked(featureFlags).personDuplicateRecordsEnabled.mockReturnValue(false)

      await getDuplicatePrisonerData(services)(req, res, next)

      expect(req.middleware.duplicatePrisonerData).toEqual([])
      expect(personApiClient.getRecord).not.toHaveBeenCalled()
      expect(prisonerSearchClient.findByNumbers).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })

    it('should proceed with API calls when enabled', async () => {
      await getDuplicatePrisonerData(services)(req, res, next)

      expect(personApiClient.getRecord).toHaveBeenCalledWith('A1234BC')
      expect(req.middleware.duplicatePrisonerData).toEqual(['B5678DE', 'C9012FG'])
      expect(next).toHaveBeenCalled()
    })
  })

  describe('Early exits', () => {
    it('should set empty array when prisonerNumber is missing from locals', async () => {
      res.locals.prisonerNumber = undefined

      await getDuplicatePrisonerData(services)(req, res, next)

      expect(req.middleware.duplicatePrisonerData).toEqual([])
      expect(personApiClient.getRecord).not.toHaveBeenCalled()
      expect(prisonerSearchClient.findByNumbers).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })

    it('should set empty array when personRecord is null', async () => {
      personApiClient.getRecord = jest.fn(async (): Promise<null> => null)

      await getDuplicatePrisonerData(services)(req, res, next)

      expect(req.middleware.duplicatePrisonerData).toEqual([])
      expect(personApiClient.getRecord).toHaveBeenCalledWith('A1234BC')
      expect(prisonerSearchClient.findByNumbers).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })

    it('should set empty array when personRecord.identifiers is missing', async () => {
      personApiClient.getRecord = jest.fn(async () => ({}))

      await getDuplicatePrisonerData(services)(req, res, next)

      expect(req.middleware.duplicatePrisonerData).toEqual([])
      expect(prisonerSearchClient.findByNumbers).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })

    it('should set empty array when personRecord.identifiers.prisonNumbers is missing', async () => {
      personApiClient.getRecord = jest.fn(async () => ({ identifiers: {} }))

      await getDuplicatePrisonerData(services)(req, res, next)

      expect(req.middleware.duplicatePrisonerData).toEqual([])
      expect(prisonerSearchClient.findByNumbers).not.toHaveBeenCalled()
      expect(next).toHaveBeenCalled()
    })
  })

  describe('Happy path', () => {
    it('should populate duplicatePrisonerData with duplicate prison numbers', async () => {
      await getDuplicatePrisonerData(services)(req, res, next)

      expect(personApiClient.getRecord).toHaveBeenCalledWith('A1234BC')
      expect(prisonerSearchClient.findByNumbers).toHaveBeenCalledWith(['A1234BC', 'B5678DE', 'C9012FG'])
      expect(req.middleware.duplicatePrisonerData).toEqual(['B5678DE', 'C9012FG'])
      expect(next).toHaveBeenCalled()
    })

    it('should exclude the current prisoner number from duplicates', async () => {
      await getDuplicatePrisonerData(services)(req, res, next)

      expect(req.middleware.duplicatePrisonerData).not.toContain('A1234BC')
      expect(req.middleware.duplicatePrisonerData).toEqual(['B5678DE', 'C9012FG'])
    })

    it('should track metrics when duplicates are found', async () => {
      await getDuplicatePrisonerData(services)(req, res, next)

      expect(metricsService.trackDuplicateRecordsFound).toHaveBeenCalledWith(
        'A1234BC',
        'MDI',
        [
          { prisonerNumber: 'B5678DE', prisonId: 'OUT' },
          { prisonerNumber: 'C9012FG', prisonId: 'TRN' },
        ],
        mockUser,
      )
    })

    it('should not track found metrics when no duplicates remain', async () => {
      prisonerSearchClient.findByNumbers = jest.fn(async () => [mockPrisoners[0]])

      await getDuplicatePrisonerData(services)(req, res, next)

      expect(req.middleware.duplicatePrisonerData).toEqual([])
      expect(metricsService.trackDuplicateRecordsFound).not.toHaveBeenCalled()
    })

    it('should handle empty prisoner search results', async () => {
      prisonerSearchClient.findByNumbers = jest.fn(async (): Promise<Prisoner[]> => [])

      await getDuplicatePrisonerData(services)(req, res, next)

      expect(req.middleware.duplicatePrisonerData).toEqual([])
      expect(next).toHaveBeenCalled()
    })
  })

  describe('GHI filtering', () => {
    it('should filter out duplicates with prisonId === GHI', async () => {
      const prisonersWithGHI: Prisoner[] = [
        createTestPrisoner('A1234BC', 'MDI'),
        createTestPrisoner('B5678DE', 'GHI'),
        createTestPrisoner('C9012FG', 'OUT'),
      ]

      prisonerSearchClient.findByNumbers = jest.fn(async () => prisonersWithGHI)

      await getDuplicatePrisonerData(services)(req, res, next)

      expect(req.middleware.duplicatePrisonerData).toEqual(['C9012FG'])
      expect(req.middleware.duplicatePrisonerData).not.toContain('B5678DE')
    })

    it('should track metrics when GHI duplicates are filtered', async () => {
      const prisonersWithGHI: Prisoner[] = [createTestPrisoner('A1234BC', 'MDI'), createTestPrisoner('B5678DE', 'GHI')]

      prisonerSearchClient.findByNumbers = jest.fn(async () => prisonersWithGHI)

      await getDuplicatePrisonerData(services)(req, res, next)

      expect(metricsService.trackDuplicateRecordsGhostEstablishmentFiltered).toHaveBeenCalledWith(
        'A1234BC',
        'MDI',
        [{ prisonerNumber: 'B5678DE', prisonId: 'GHI' }],
        mockUser,
      )
    })

    it('should filter multiple GHI duplicates', async () => {
      const prisonersWithMultipleGHI: Prisoner[] = [
        createTestPrisoner('A1234BC', 'MDI'),
        createTestPrisoner('B5678DE', 'GHI'),
        createTestPrisoner('C9012FG', 'GHI'),
        createTestPrisoner('D3456HI', 'OUT'),
      ]

      prisonerSearchClient.findByNumbers = jest.fn(async () => prisonersWithMultipleGHI)

      await getDuplicatePrisonerData(services)(req, res, next)

      expect(req.middleware.duplicatePrisonerData).toEqual(['D3456HI'])
      expect(metricsService.trackDuplicateRecordsGhostEstablishmentFiltered).toHaveBeenCalledWith(
        'A1234BC',
        'MDI',
        [
          { prisonerNumber: 'B5678DE', prisonId: 'GHI' },
          { prisonerNumber: 'C9012FG', prisonId: 'GHI' },
        ],
        mockUser,
      )
    })

    it('should not track GHI metrics when no GHI duplicates exist', async () => {
      await getDuplicatePrisonerData(services)(req, res, next)

      expect(metricsService.trackDuplicateRecordsGhostEstablishmentFiltered).not.toHaveBeenCalled()
    })
  })

  describe('Multiple active duplicates filtering', () => {
    it('should remove all duplicates when original + duplicates total 2+ active', async () => {
      // Original active (MDI) + 2 active duplicates = 3 total active → filter all
      const prisonersWithMultipleActive: Prisoner[] = [
        createTestPrisoner('A1234BC', 'MDI'),
        createTestPrisoner('B5678DE', 'LEI'),
        createTestPrisoner('C9012FG', 'BXI'),
      ]

      prisonerSearchClient.findByNumbers = jest.fn(async () => prisonersWithMultipleActive)

      await getDuplicatePrisonerData(services)(req, res, next)

      expect(req.middleware.duplicatePrisonerData).toEqual([])
    })

    it('should track metrics when total active count (original + duplicates) >= 2', async () => {
      // Original active (MDI) + 2 active duplicates = 3 total → filter
      const prisonersWithMultipleActive: Prisoner[] = [
        createTestPrisoner('A1234BC', 'MDI'),
        createTestPrisoner('B5678DE', 'LEI'),
        createTestPrisoner('C9012FG', 'BXI'),
      ]

      prisonerSearchClient.findByNumbers = jest.fn(async () => prisonersWithMultipleActive)

      await getDuplicatePrisonerData(services)(req, res, next)

      expect(metricsService.trackDuplicateRecordsMultipleActiveFiltered).toHaveBeenCalledWith(
        'A1234BC',
        'MDI',
        [
          { prisonerNumber: 'B5678DE', prisonId: 'LEI' },
          { prisonerNumber: 'C9012FG', prisonId: 'BXI' },
        ],
        mockUser,
      )
    })

    it('should allow duplicates when original is active with no active duplicates', async () => {
      // Original active (MDI) + 1 inactive duplicate (OUT) = 1 total active → keep
      const prisonersWithInactiveDuplicates: Prisoner[] = [
        createTestPrisoner('A1234BC', 'MDI'),
        createTestPrisoner('B5678DE', 'OUT'),
      ]

      prisonerSearchClient.findByNumbers = jest.fn(async () => prisonersWithInactiveDuplicates)

      await getDuplicatePrisonerData(services)(req, res, next)

      expect(req.middleware.duplicatePrisonerData).toEqual(['B5678DE'])
      expect(metricsService.trackDuplicateRecordsMultipleActiveFiltered).not.toHaveBeenCalled()
    })

    it('should allow duplicates when original is inactive with 1 active duplicate', async () => {
      // Original inactive (OUT) + 1 active duplicate (LEI) = 1 total active → keep
      const prisonersInactiveOriginalOneActiveDuplicate: Prisoner[] = [
        createTestPrisoner('A1234BC', 'OUT'),
        createTestPrisoner('B5678DE', 'LEI'),
      ]

      prisonerSearchClient.findByNumbers = jest.fn(async () => prisonersInactiveOriginalOneActiveDuplicate)

      await getDuplicatePrisonerData(services)(req, res, next)

      expect(req.middleware.duplicatePrisonerData).toEqual(['B5678DE'])
      expect(metricsService.trackDuplicateRecordsMultipleActiveFiltered).not.toHaveBeenCalled()
    })

    it('should filter all duplicates when original is inactive with 2+ active duplicates', async () => {
      // Original inactive (OUT) + 2 active duplicates = 2 total active → filter
      const prisonersInactiveOriginalMultipleActiveDuplicates: Prisoner[] = [
        createTestPrisoner('A1234BC', 'OUT'),
        createTestPrisoner('B5678DE', 'LEI'),
        createTestPrisoner('C9012FG', 'BXI'),
      ]

      prisonerSearchClient.findByNumbers = jest.fn(async () => prisonersInactiveOriginalMultipleActiveDuplicates)

      await getDuplicatePrisonerData(services)(req, res, next)

      expect(req.middleware.duplicatePrisonerData).toEqual([])
      expect(metricsService.trackDuplicateRecordsMultipleActiveFiltered).toHaveBeenCalledWith(
        'A1234BC',
        'OUT',
        [
          { prisonerNumber: 'B5678DE', prisonId: 'LEI' },
          { prisonerNumber: 'C9012FG', prisonId: 'BXI' },
        ],
        mockUser,
      )
    })

    it('should filter all when original active + 1 active duplicate (total 2)', async () => {
      // Original active (MDI) + 1 active duplicate (LEI) = 2 total active → filter
      const prisonersOneEach: Prisoner[] = [createTestPrisoner('A1234BC', 'MDI'), createTestPrisoner('B5678DE', 'LEI')]

      prisonerSearchClient.findByNumbers = jest.fn(async () => prisonersOneEach)

      await getDuplicatePrisonerData(services)(req, res, next)

      expect(req.middleware.duplicatePrisonerData).toEqual([])
      expect(metricsService.trackDuplicateRecordsMultipleActiveFiltered).toHaveBeenCalledWith(
        'A1234BC',
        'MDI',
        [{ prisonerNumber: 'B5678DE', prisonId: 'LEI' }],
        mockUser,
      )
    })

    it('should treat TRN prisonId as inactive when counting total active', async () => {
      // Original active (MDI) + 1 active duplicate (LEI) + 1 TRN = 2 total active → filter
      const prisonersWithTRN: Prisoner[] = [
        createTestPrisoner('A1234BC', 'MDI'),
        createTestPrisoner('B5678DE', 'LEI'),
        createTestPrisoner('C9012FG', 'TRN'),
      ]

      prisonerSearchClient.findByNumbers = jest.fn(async () => prisonersWithTRN)

      await getDuplicatePrisonerData(services)(req, res, next)

      expect(req.middleware.duplicatePrisonerData).toEqual([])
      expect(metricsService.trackDuplicateRecordsMultipleActiveFiltered).toHaveBeenCalledWith(
        'A1234BC',
        'MDI',
        [
          { prisonerNumber: 'B5678DE', prisonId: 'LEI' },
          { prisonerNumber: 'C9012FG', prisonId: 'TRN' },
        ],
        mockUser,
      )
    })

    it('should treat OUT prisonId as inactive when counting total active', async () => {
      // Original active (MDI) + 1 active duplicate (LEI) + 1 OUT = 2 total active → filter
      const prisonersWithOUT: Prisoner[] = [
        createTestPrisoner('A1234BC', 'MDI'),
        createTestPrisoner('B5678DE', 'LEI'),
        createTestPrisoner('C9012FG', 'OUT'),
      ]

      prisonerSearchClient.findByNumbers = jest.fn(async () => prisonersWithOUT)

      await getDuplicatePrisonerData(services)(req, res, next)

      expect(req.middleware.duplicatePrisonerData).toEqual([])
      expect(metricsService.trackDuplicateRecordsMultipleActiveFiltered).toHaveBeenCalledWith(
        'A1234BC',
        'MDI',
        [
          { prisonerNumber: 'B5678DE', prisonId: 'LEI' },
          { prisonerNumber: 'C9012FG', prisonId: 'OUT' },
        ],
        mockUser,
      )
    })
  })

  describe('Combined filtering scenarios', () => {
    it('should apply GHI filter before multiple active filter', async () => {
      const prisoners: Prisoner[] = [
        createTestPrisoner('A1234BC', 'MDI'),
        createTestPrisoner('B5678DE', 'GHI'),
        createTestPrisoner('C9012FG', 'OUT'),
        createTestPrisoner('D3456HI', 'TRN'),
      ]

      prisonerSearchClient.findByNumbers = jest.fn(async () => prisoners)

      await getDuplicatePrisonerData(services)(req, res, next)

      // B5678DE filtered as GHI, leaving only inactive duplicates
      expect(req.middleware.duplicatePrisonerData).toEqual(['C9012FG', 'D3456HI'])
      expect(metricsService.trackDuplicateRecordsGhostEstablishmentFiltered).toHaveBeenCalledWith(
        'A1234BC',
        'MDI',
        [{ prisonerNumber: 'B5678DE', prisonId: 'GHI' }],
        mockUser,
      )
      expect(metricsService.trackDuplicateRecordsMultipleActiveFiltered).not.toHaveBeenCalled()
    })
  })

  describe('Error handling', () => {
    it('should handle Person API failure gracefully', async () => {
      const error = new Error('API request failed')
      personApiClient.getRecord = jest.fn().mockRejectedValue(error)

      await getDuplicatePrisonerData(services)(req, res, next)

      expect(req.middleware.duplicatePrisonerData).toEqual([])
      expect(res.locals.duplicateRecordApiFailure).toBe(true)
      expect(metricsService.trackDuplicateRecordsApiFailure).toHaveBeenCalledWith('A1234BC', 'MDI', error, mockUser)
      expect(next).toHaveBeenCalled()
    })

    it('should handle Prisoner Search API failure gracefully', async () => {
      const error = new Error('API request failed')
      prisonerSearchClient.findByNumbers = jest.fn().mockRejectedValue(error)

      await getDuplicatePrisonerData(services)(req, res, next)

      expect(req.middleware.duplicatePrisonerData).toEqual([])
      expect(res.locals.duplicateRecordApiFailure).toBe(true)
      expect(metricsService.trackDuplicateRecordsApiFailure).toHaveBeenCalledWith('A1234BC', 'MDI', error, mockUser)
      expect(next).toHaveBeenCalled()
    })

    it('should not call Prisoner Search API when Person API fails', async () => {
      personApiClient.getRecord = jest.fn().mockRejectedValue(new Error('API request failed'))

      await getDuplicatePrisonerData(services)(req, res, next)

      expect(prisonerSearchClient.findByNumbers).not.toHaveBeenCalled()
    })
  })
})
