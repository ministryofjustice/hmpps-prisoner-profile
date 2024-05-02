import { NextFunction } from 'express'
import checkUserCanEdit from './checkUserCanEditMiddleware'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import RoleError from '../utils/roleError'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import ServerError from '../utils/serverError'

let req: any
let res: any
let next: NextFunction

describe('CheckUserCanEditMiddleware', () => {
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
          authSource: 'nomis',
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

  describe('Successful calls', () => {
    it('should return next() if prisoner is in caseload', async () => {
      await checkUserCanEdit()(req, res, next)
      expect(req.middleware.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
    })

    it('should return next() if prisoner is inactive and user has role', async () => {
      req.middleware = {
        prisonerData: { ...PrisonerMockDataA, prisonId: 'OUT' },
      }
      res.locals.user.userRoles = [Role.InactiveBookings]

      await checkUserCanEdit()(req, res, next)
      expect(req.middleware.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
    })

    it('should return next() if prisoner is in caseload', async () => {
      req.middleware = {
        prisonerData: { ...PrisonerMockDataA, prisonId: 'ZZZ', restrictedPatient: true },
      }
      res.locals.user.userRoles = [Role.PomUser]

      await checkUserCanEdit()(req, res, next)
      expect(req.middleware.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
    })
  })

  it('should return ServerError if no prisonerData found in middleware', async () => {
    delete req.middleware

    await checkUserCanEdit()(req, res, next)
    expect(req.middleware).not.toBeDefined()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(
      new ServerError('CheckUserCanEditMiddleware: No PrisonerData found in middleware'),
    )
  })

  describe('Used inside GuardMiddleware', () => {
    beforeEach(() => {
      req.middleware = {
        prisonerData: { ...PrisonerMockDataA, prisonId: 'ZZZ' },
        usingGuard: 1,
      }
    })

    it('should populate middleware.errors on fail', async () => {
      await checkUserCanEdit()(req, res, next)
      expect(req.middleware.errors).toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith('route')
    })
  })

  describe('Used outside GuardMiddleware', () => {
    beforeEach(() => {
      req.middleware = {
        prisonerData: { ...PrisonerMockDataA, prisonId: 'ZZZ' },
        usingGuard: 0,
      }
    })

    it('should return next(error) on fail', async () => {
      await checkUserCanEdit()(req, res, next)
      expect(req.middleware.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith(new RoleError('CheckUserCanEditMiddleware: not authorised for test/path'))
    })
  })
})
