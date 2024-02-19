import { NextFunction } from 'express'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import checkPrisonerInCaseload from './checkPrisonerInCaseloadMiddleware'
import ServerError from '../utils/serverError'
import NotFoundError from '../utils/notFoundError'

let req: any
let res: any
let next: NextFunction

describe('CheckPrisonerInCaseloadMiddleware', () => {
  beforeEach(() => {
    req = {
      params: { prisonerNumber: 'G6123VU' },
      path: 'test/path',
      middleware: {
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
        clientToken: 'CLIENT_TOKEN',
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
      req.middleware.prisonerData.prisonId = 'OUT'

      await checkPrisonerInCaseload()(req, res, next)
      expect(req.middleware.errors).toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith('route')
    })

    it('should add middleware error if inactive booking and allowInactive is false', async () => {
      req.middleware.prisonerData.prisonId = 'OUT'

      await checkPrisonerInCaseload({ allowInactive: false })(req, res, next)
      expect(req.middleware.errors).toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith('route')
    })

    it('should return next() if inactive booking and user does have role', async () => {
      req.middleware.prisonerData.prisonId = 'OUT'
      res.locals.user.userRoles = [Role.InactiveBookings]

      await checkPrisonerInCaseload()(req, res, next)
      expect(req.middleware?.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
    })

    it('should return next() if inactive booking and allowInactive is true and user has role', async () => {
      req.middleware.prisonerData.prisonId = 'OUT'
      res.locals.user.userRoles = [Role.InactiveBookings]

      await checkPrisonerInCaseload()(req, res, next)
      expect(req.middleware?.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
    })

    it('should add middleware error if prisoner not in caseload and user does not have global search role', async () => {
      req.middleware.prisonerData.prisonId = 'ZZZ'

      await checkPrisonerInCaseload()(req, res, next)
      expect(req.middleware.errors).toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith('route')
    })

    it('should add middleware error if prisoner not in caseload and allowGlobal is false', async () => {
      req.middleware.prisonerData.prisonId = 'ZZZ'

      await checkPrisonerInCaseload({ allowGlobal: false })(req, res, next)
      expect(req.middleware.errors).toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith('route')
    })

    it('should return next() if prisoner not in caseload and allowGlobal is true and user has role', async () => {
      req.middleware.prisonerData.prisonId = 'ZZZ'
      res.locals.user.userRoles = [Role.GlobalSearch]

      await checkPrisonerInCaseload()(req, res, next)
      expect(req.middleware?.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
    })
  })

  describe('Used outside GuardMiddleware', () => {
    it('should return NotFoundError if inactive booking and user does not have role', async () => {
      req.middleware.prisonerData.prisonId = 'OUT'

      await checkPrisonerInCaseload()(req, res, next)
      expect(req.middleware.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith(
        new NotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner is inactive [OUT]'),
      )
    })

    it('should return NotFoundError if inactive booking and allowInactive is false', async () => {
      req.middleware.prisonerData.prisonId = 'OUT'

      await checkPrisonerInCaseload({ allowInactive: false })(req, res, next)
      expect(req.middleware.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith(
        new NotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner is inactive [OUT]'),
      )
    })

    it('should return next() if inactive booking and user does have role', async () => {
      req.middleware.prisonerData.prisonId = 'OUT'
      res.locals.user.userRoles = [Role.InactiveBookings]

      await checkPrisonerInCaseload()(req, res, next)
      expect(req.middleware?.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
    })

    it('should return next() if inactive booking and allowInactive is true and user has role', async () => {
      req.middleware.prisonerData.prisonId = 'OUT'
      res.locals.user.userRoles = [Role.InactiveBookings]

      await checkPrisonerInCaseload()(req, res, next)
      expect(req.middleware?.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
    })

    it('should return NotFoundError if prisoner not in caseload and user does not have global search role', async () => {
      req.middleware.prisonerData.prisonId = 'ZZZ'

      await checkPrisonerInCaseload()(req, res, next)
      expect(req.middleware.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith(
        new NotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner not in caseloads'),
      )
    })

    it('should return NotFoundError if prisoner not in caseload and allowGlobal is false', async () => {
      req.middleware.prisonerData.prisonId = 'ZZZ'

      await checkPrisonerInCaseload({ allowGlobal: false })(req, res, next)
      expect(req.middleware.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith(
        new NotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner not in caseloads'),
      )
    })

    it('should return next() if prisoner not in caseload and allowGlobal is true and user has role', async () => {
      req.middleware.prisonerData.prisonId = 'ZZZ'
      res.locals.user.userRoles = [Role.GlobalSearch]

      await checkPrisonerInCaseload()(req, res, next)
      expect(req.middleware?.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
    })
  })

  describe('Restricted patients', () => {
    beforeEach(() => {
      req.middleware.prisonerData.restrictedPatient = true
    })

    it('Does not let users view a restricted patient without a POM role', async () => {
      res.locals.user.userRoles = [Role.PrisonUser]
      await checkPrisonerInCaseload()(req, res, next)
      expect(req.middleware.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith(
        new NotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner is restricted patient'),
      )
    })

    describe('Given a POM user', () => {
      beforeEach(() => {
        res.locals.user.userRoles = [Role.PrisonUser, 'POM']
      })

      it('Does not let users view a patient without the supporting prison caseload', async () => {
        req.middleware.prisonerData.supportingPrisonId = 'XYZ'
        await checkPrisonerInCaseload()(req, res, next)
        expect(req.middleware.errors).not.toBeDefined()
        expect(next).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith(
          new NotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner is restricted patient'),
        )
      })

      it('Lets users view a patient with the active supporting prison', async () => {
        res.locals.user.caseLoads[0].caseLoadId = 'LEI'
        req.middleware.prisonerData.supportingPrisonId = 'LEI'

        await checkPrisonerInCaseload()(req, res, next)
        expect(req.middleware.errors).not.toBeDefined()
        expect(next).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith()
      })
    })
  })
})
