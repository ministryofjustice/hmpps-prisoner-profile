import { NextFunction } from 'express'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import checkPrisonerInCaseload from './checkPrisonerInCaseloadMiddleware'
import ServerError from '../utils/serverError'
import NotFoundError from '../utils/notFoundError'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'

let req: any
let res: any
let next: NextFunction

describe('CheckPrisonerInCaseloadMiddleware', () => {
  function expectNotFoundError(errorMessage: string) {
    expect(req.middleware.errors).not.toBeDefined()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(new NotFoundError(errorMessage))
  }

  function expectAccessToBeGranted() {
    expect(req.middleware.errors).not.toBeDefined()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
  }

  function setPrisonerData(prisonerData: Partial<Prisoner>) {
    req.middleware.prisonerData = { ...req.middleware.prisonerData, ...prisonerData }
  }

  beforeEach(() => {
    req = {
      params: { prisonerNumber: 'G6123VU' },
      path: 'test/path',
      middleware: {
        clientToken: 'CLIENT_TOKEN',
        prisonerData: PrisonerMockDataA,
      },
    }
    res = {
      locals: {
        user: {
          activeCaseLoadId: 'MDI',
          userRoles: [Role.PrisonUser],
          caseLoads: CaseLoadsDummyDataA,
        },
      },
      render: jest.fn(),
    }
    next = jest.fn()
  })
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('should return ServerError if no prisonerData found in middleware', async () => {
    delete req.middleware

    await checkPrisonerInCaseload()(req, res, next)
    expect(req.middleware).not.toBeDefined()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(
      new ServerError('CheckPrisonerInCaseloadMiddleware: No PrisonerData found in middleware'),
    )
  })

  describe('Used inside GuardMiddleware', () => {
    beforeEach(() => {
      req.middleware = {
        ...req.middleware,
        usingGuard: 1,
      }
    })

    it('should add middleware error if inactive booking and user does not have role', async () => {
      setPrisonerData({ prisonId: 'OUT' })

      await checkPrisonerInCaseload()(req, res, next)
      expect(req.middleware.errors).toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith('route')
    })

    it('should add middleware error if inactive booking and allowInactive is false', async () => {
      setPrisonerData({ prisonId: 'OUT' })

      await checkPrisonerInCaseload({ allowInactive: false })(req, res, next)
      expect(req.middleware.errors).toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith('route')
    })

    it('should return next() if inactive booking and user does have role', async () => {
      setPrisonerData({ prisonId: 'OUT' })
      res.locals.user.userRoles = [Role.InactiveBookings]

      await checkPrisonerInCaseload()(req, res, next)
      expect(req.middleware?.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
    })

    it('should return next() if inactive booking and allowInactive is true and user has role', async () => {
      setPrisonerData({ prisonId: 'OUT' })
      res.locals.user.userRoles = [Role.InactiveBookings]

      await checkPrisonerInCaseload()(req, res, next)
      expect(req.middleware?.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
    })

    it('should add middleware error if prisoner not in caseload and user does not have global search role', async () => {
      setPrisonerData({ prisonId: 'ZZZ' })
      req.middleware.prisonerData.prisonId = 'ZZZ'

      await checkPrisonerInCaseload()(req, res, next)
      expect(req.middleware.errors).toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith('route')
    })

    it('should add middleware error if prisoner not in caseload and allowGlobal is false', async () => {
      setPrisonerData({ prisonId: 'ZZZ' })

      await checkPrisonerInCaseload({ allowGlobal: false })(req, res, next)
      expect(req.middleware.errors).toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith('route')
    })

    it('should return next() if prisoner not in caseload and allowGlobal is true and user has role', async () => {
      setPrisonerData({ prisonId: 'ZZZ' })
      res.locals.user.userRoles = [Role.GlobalSearch]

      await checkPrisonerInCaseload()(req, res, next)
      expect(req.middleware?.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
    })
  })

  describe('Used outside GuardMiddleware', () => {
    describe('Restricted patients', () => {
      beforeEach(() => {
        req.middleware.prisonerData = { ...req.middleware.prisonerData, restrictedPatient: true, prisonId: 'OUT' }
      })

      it('Does not let users view a restricted patient without a POM or inactive bookings role', async () => {
        res.locals.user.userRoles = [Role.PrisonUser]
        await checkPrisonerInCaseload()(req, res, next)
        expectNotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner is restricted patient')
      })

      describe('Given a POM user', () => {
        beforeEach(() => {
          res.locals.user.userRoles = [Role.PrisonUser, Role.PomUser]
        })

        it('Does not let users view a patient without the supporting prison caseload', async () => {
          setPrisonerData({ supportingPrisonId: 'XYZ' })
          await checkPrisonerInCaseload()(req, res, next)
          expectNotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner is restricted patient')
        })

        it('Lets users view a patient with the active supporting prison', async () => {
          const secondCaseload = { ...CaseLoadsDummyDataA, caseLoadId: 'LEI' }
          res.locals.user.caseLoads = [...res.locals.user.caseLoads, secondCaseload]
          setPrisonerData({ supportingPrisonId: 'LEI' })

          await checkPrisonerInCaseload()(req, res, next)
          expectAccessToBeGranted()
        })

        it('Respects active caseload only check', async () => {
          const secondCaseload = { ...CaseLoadsDummyDataA, caseLoadId: 'LEI' }
          res.locals.user.caseLoads = [...res.locals.user.caseLoads, secondCaseload]
          setPrisonerData({ supportingPrisonId: 'LEI' })

          res.locals.user.activeCaseLoadId = 'MDI'

          await checkPrisonerInCaseload({ activeCaseloadOnly: true })(req, res, next)
          expectNotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner not in active caseload')
        })
      })

      describe('Given a user with the inactive bookings role', () => {
        beforeEach(() => {
          res.locals.user.userRoles = [Role.PrisonUser, Role.InactiveBookings]
        })

        it('Respects active caseload only check', async () => {
          const secondCaseload = { ...CaseLoadsDummyDataA, caseLoadId: 'LEI' }
          res.locals.user.caseLoads = [...res.locals.user.caseLoads, secondCaseload]
          setPrisonerData({ supportingPrisonId: 'LEI' })

          res.locals.user.activeCaseLoadId = 'MDI'

          await checkPrisonerInCaseload({ activeCaseloadOnly: true })(req, res, next)
          expectNotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner not in active caseload')
        })

        it('should return next()', async () => {
          await checkPrisonerInCaseload()(req, res, next)
          expectAccessToBeGranted()
        })
      })
    })

    describe('Released prisoners (Caseload: OUT)', () => {
      beforeEach(() => {
        setPrisonerData({ prisonId: 'OUT' })
      })

      it('should return NotFoundError if user does not inactive bookings role', async () => {
        await checkPrisonerInCaseload()(req, res, next)
        expectNotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner is inactive [OUT]')
      })

      it('should return NotFoundError if user has the global search role', async () => {
        res.locals.user.userRoles = [Role.GlobalSearch]

        await checkPrisonerInCaseload()(req, res, next)
        expectNotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner is inactive [OUT]')
      })

      it('should return NotFoundError if allowInactive is false and the user has the inactive bookings role', async () => {
        res.locals.user.userRoles = [Role.InactiveBookings]

        await checkPrisonerInCaseload({ allowInactive: false })(req, res, next)
        expectNotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner is inactive [OUT]')
      })

      it('should return next() if user does have the inactive bookings role', async () => {
        res.locals.user.userRoles = [Role.InactiveBookings]

        await checkPrisonerInCaseload()(req, res, next)
        expectAccessToBeGranted()
      })
    })

    describe('Transferring prisoners (Caseload: TRN)', () => {
      beforeEach(() => {
        setPrisonerData({ prisonId: 'TRN' })
      })

      it('should return NotFoundError if user does not have global search or inactive bookings role', async () => {
        await checkPrisonerInCaseload()(req, res, next)
        expectNotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner is inactive [TRN]')
      })

      it.each([Role.GlobalSearch, Role.InactiveBookings])(
        'should return NotFoundError if allowInactive is false and user has role %s',
        async role => {
          res.locals.user.userRoles = [role]
          await checkPrisonerInCaseload({ allowInactive: false })(req, res, next)
          expectNotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner is inactive [TRN]')
        },
      )

      it.each([Role.GlobalSearch, Role.InactiveBookings])('should return next() if user has role %s', async role => {
        res.locals.user.userRoles = [role]

        await checkPrisonerInCaseload()(req, res, next)
        expectAccessToBeGranted()
      })
    })

    describe('Active prisoners', () => {
      describe('Active caseload only', () => {
        it('Should return NotFoundError if activeCaseloadOnly is true and the user has that caseload inactive', async () => {
          setPrisonerData({ prisonId: 'ABC' })
          const secondCaseload = { ...CaseLoadsDummyDataA, caseLoadId: 'ABC' }
          res.locals.user.caseLoads = [...res.locals.user.caseLoads, secondCaseload]

          await checkPrisonerInCaseload({ activeCaseloadOnly: true })(req, res, next)
          expectNotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner not in active caseload')
        })

        it('Should return NotFoundError for global search user accessing a prisoner outside their caseloads', async () => {
          setPrisonerData({ prisonId: 'ZZZ' })
          res.locals.user.caseLoads = [...res.locals.user.caseLoads]
          res.locals.user.userRoles = [Role.GlobalSearch]

          await checkPrisonerInCaseload({ activeCaseloadOnly: true })(req, res, next)
          expectNotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner not in active caseload')
        })

        it('Should allow access for user accessing a prisoner within their active caseload', async () => {
          setPrisonerData({ prisonId: 'ABC' })
          const secondCaseload = { ...CaseLoadsDummyDataA, caseLoadId: 'ABC' }
          res.locals.user.caseLoads = [...res.locals.user.caseLoads, secondCaseload]
          res.locals.user.activeCaseLoadId = 'ABC'

          await checkPrisonerInCaseload({ activeCaseloadOnly: true })(req, res, next)
          expectAccessToBeGranted()
        })
      })

      describe('Prisoner outside of users caseloads (Global search)', () => {
        it('should return NotFoundError if prisoner not in caseload and user does not have global search role', async () => {
          setPrisonerData({ prisonId: 'ZZZ' })

          await checkPrisonerInCaseload()(req, res, next)
          expectNotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner not in caseloads')
        })

        it('should return NotFoundError if prisoner not in caseload and allowGlobal is false', async () => {
          setPrisonerData({ prisonId: 'ZZZ' })

          await checkPrisonerInCaseload({ allowGlobal: false })(req, res, next)
          expect(req.middleware.errors).not.toBeDefined()
          expectNotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner not in caseloads')
        })

        it('should return next() if prisoner not in caseload and allowGlobal is true and user has role', async () => {
          setPrisonerData({ prisonId: 'ZZZ' })
          res.locals.user.userRoles = [Role.GlobalSearch]

          await checkPrisonerInCaseload()(req, res, next)
          expectAccessToBeGranted()
        })

        it('should return next() if user has roles POM and GLOBAL_SEARCH, allowGlobal is false but allowGlobalPom is true', async () => {
          res.locals.user.userRoles = [Role.PomUser, Role.GlobalSearch]

          setPrisonerData({ prisonId: 'ZZZ' })

          await checkPrisonerInCaseload({ allowGlobal: false, allowGlobalPom: true })(req, res, next)
          expectAccessToBeGranted()
        })
      })

      describe('Prisoner inside users caseloads', () => {
        it('Should grant access to prisoner inside users active caseload', async () => {
          await checkPrisonerInCaseload()(req, res, next)
          expectAccessToBeGranted()
        })

        it('Should grant access to prisoner inside users inactive caseload', async () => {
          const secondCaseload = { ...CaseLoadsDummyDataA, caseLoadId: 'ABC' }
          res.locals.user.caseLoads = [...res.locals.user.caseLoads, secondCaseload]
          res.locals.user.activeCaseLoadId = 'ABC'
          await checkPrisonerInCaseload()(req, res, next)
          expectAccessToBeGranted()
        })
      })
    })
  })
})
