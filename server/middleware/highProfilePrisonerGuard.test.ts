import type { NextFunction, Request, Response } from 'express'
import config from '../config'
import { highProfilePrisonerGuard } from './highProfilePrisonerGuard'

describe('highProfilePrisonerGuard', () => {
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
    res = { locals: {} } as Response
    next = jest.fn() as NextFunction
  })

  it('should be disabled by default', () => {
    res.locals.isHighProfilePrisoner = true
    res.locals.isHighProfilePrisonerOutsideCaseloads = true

    highProfilePrisonerGuard('outside-caseloads')(req, res, next)
    highProfilePrisonerGuard('any')(req, res, next)

    expect(next).toHaveBeenCalledWith()
    expect(next).toHaveBeenCalledTimes(2)
  })

  describe('when enabled', () => {
    beforeEach(() => {
      config.featureToggles.highProfilePrisonersEnabled = true
    })

    describe('and forbidding access to high-profile prisoners outside caseloads', () => {
      const middleware = highProfilePrisonerGuard('outside-caseloads')

      it.each([
        {
          scenario: 'not high-profile',
          setup() {
            res.locals.isHighProfilePrisoner = false
            res.locals.isHighProfilePrisonerOutsideCaseloads = false
          },
        },
        {
          scenario: 'high-profile and in caseloads',
          setup() {
            res.locals.isHighProfilePrisoner = true
            res.locals.isHighProfilePrisonerOutsideCaseloads = false
          },
        },
      ])('should defer to next request handler when prisoner is $scenario', ({ setup }) => {
        setup()

        middleware(req, res, next)

        expect(next).toHaveBeenCalledWith()
      })

      it('should 404 when prisoner is high-profile and outside caseloads', () => {
        res.locals.isHighProfilePrisoner = true
        res.locals.isHighProfilePrisonerOutsideCaseloads = true

        middleware(req, res, next)

        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'User is not allowed to access this page',
            status: 404,
          }),
        )
      })
    })

    describe('and forbidding access to all high-profile prisoners', () => {
      const middleware = highProfilePrisonerGuard('any')

      it('should defer to next request handler when prisoner is not high-profile', () => {
        res.locals.isHighProfilePrisoner = false
        res.locals.isHighProfilePrisonerOutsideCaseloads = false

        middleware(req, res, next)

        expect(next).toHaveBeenCalledWith()
      })

      it.each([
        {
          scenario: 'high-profile and in caseloads',
          setup() {
            res.locals.isHighProfilePrisoner = true
            res.locals.isHighProfilePrisonerOutsideCaseloads = false
          },
        },
        {
          scenario: 'high-profile and outside caseloads',
          setup() {
            res.locals.isHighProfilePrisoner = true
            res.locals.isHighProfilePrisonerOutsideCaseloads = true
          },
        },
      ])('should 404 when prisoner is $scenario', ({ setup }) => {
        setup()

        middleware(req, res, next)

        expect(next).toHaveBeenCalledWith(
          expect.objectContaining({
            message: 'User is not allowed to access this page',
            status: 404,
          }),
        )
      })
    })
  })
})
