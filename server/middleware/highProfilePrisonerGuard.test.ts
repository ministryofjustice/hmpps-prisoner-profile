import type { NextFunction, Request, Response } from 'express'
import config from '../config'
import isGlobalHighPriorityPrisoner from '../utils/isGlobalHighPriorityPrisoner'
import { highProfilePrisonerGuard } from './highProfilePrisonerGuard'

jest.mock('../utils/isGlobalHighPriorityPrisoner')

describe('highProfilePrisonerGuard', () => {
  const isGlobalHighPriorityPrisonerMock = jest.mocked(isGlobalHighPriorityPrisoner)
  const middleware = highProfilePrisonerGuard()

  let req: Request
  let res: Response
  let next: NextFunction

  let wasHighProfilePrisonersEnabled: boolean
  beforeAll(() => {
    wasHighProfilePrisonersEnabled = config.featureToggles.highProfilePrisonersEnabled
  })
  afterAll(() => {
    config.featureToggles.highProfilePrisonersEnabled = wasHighProfilePrisonersEnabled
  })

  beforeEach(() => {
    req = {} as Request
    res = {} as Response
    next = jest.fn() as NextFunction
  })

  it('should be disabled by default', () => {
    middleware(req, res, next)

    expect(next).toHaveBeenCalledWith()
    expect(isGlobalHighPriorityPrisonerMock).not.toHaveBeenCalled()
  })

  describe('when enabled', () => {
    beforeEach(() => {
      config.featureToggles.highProfilePrisonersEnabled = true
    })

    it('should defer to next request handler when isGlobalHighPriorityPrisoner returns false', () => {
      isGlobalHighPriorityPrisonerMock.mockReturnValue(false)

      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(isGlobalHighPriorityPrisonerMock).toHaveBeenCalledWith()
    })

    it('should 404 when isGlobalHighPriorityPrisoner returns true', () => {
      isGlobalHighPriorityPrisonerMock.mockReturnValue(true)

      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User is not allowed to access this page',
          status: 404,
        }),
      )
      expect(isGlobalHighPriorityPrisonerMock).toHaveBeenCalledWith()
    })
  })
})
