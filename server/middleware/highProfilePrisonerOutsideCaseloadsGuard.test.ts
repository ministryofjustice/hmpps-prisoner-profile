import type { NextFunction, Request, Response } from 'express'
import config from '../config'
import isHighProfilePrisonerOutsideCaseloads from '../utils/isHighProfilePrisonerOutsideCaseloads'
import { highProfilePrisonerOutsideCaseloadsGuard } from './highProfilePrisonerOutsideCaseloadsGuard'

jest.mock('../utils/isHighProfilePrisonerOutsideCaseloads')

describe('highProfilePrisonerOutsideCaseloadsGuard', () => {
  const isHighProfilePrisonerOutsideCaseloadsMock = jest.mocked(isHighProfilePrisonerOutsideCaseloads)
  const middleware = highProfilePrisonerOutsideCaseloadsGuard()

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
    expect(isHighProfilePrisonerOutsideCaseloadsMock).not.toHaveBeenCalled()
  })

  describe('when enabled', () => {
    beforeEach(() => {
      config.featureToggles.highProfilePrisonersEnabled = true
    })

    it('should defer to next request handler when isHighProfilePrisonerOutsideCaseloads returns false', () => {
      isHighProfilePrisonerOutsideCaseloadsMock.mockReturnValue(false)

      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith()
      expect(isHighProfilePrisonerOutsideCaseloadsMock).toHaveBeenCalledWith()
    })

    it('should 404 when isHighProfilePrisonerOutsideCaseloads returns true', () => {
      isHighProfilePrisonerOutsideCaseloadsMock.mockReturnValue(true)

      middleware(req, res, next)

      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'User is not allowed to access this page',
          status: 404,
        }),
      )
      expect(isHighProfilePrisonerOutsideCaseloadsMock).toHaveBeenCalledWith()
    })
  })
})
