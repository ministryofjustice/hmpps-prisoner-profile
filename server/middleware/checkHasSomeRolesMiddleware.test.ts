import { NextFunction } from 'express'
import checkHasSomeRoles from './checkHasSomeRolesMiddleware'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import RoleError from '../utils/roleError'

let req: any
let res: any
let next: NextFunction

describe('CheckHasSomeRolesMiddleware', () => {
  beforeEach(() => {
    req = {
      params: { prisonerNumber: 'G6123VU' },
      path: 'test/path',
    }
    res = {
      locals: {
        user: {
          activeCaseLoadId: 'MDI',
          userRoles: [Role.PomUser, Role.ReceptionUser],
          caseLoads: CaseLoadsDummyDataA,
        },
        clientToken: 'CLIENT_TOKEN',
      },
      render: jest.fn(),
    }
    next = jest.fn()
  })

  it('should return next() on success', () => {
    checkHasSomeRoles([Role.PomUser, Role.ReceptionUser])(req, res, next)
    expect(req.middleware).not.toBeDefined()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
  })

  describe('Used inside GuardMiddleware', () => {
    beforeEach(() => {
      req.middleware = {
        usingGuard: 1,
      }
    })

    it('should populate middleware.errors on fail', () => {
      checkHasSomeRoles([Role.InactiveBookings, Role.CategorisationSecurity])(req, res, next)
      expect(req.middleware.errors).toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
    })
  })

  describe('Used outside GuardMiddleware', () => {
    beforeEach(() => {
      req.middleware = {
        usingGuard: 0,
      }
    })

    it('should return next(error) on fail', () => {
      checkHasSomeRoles([Role.InactiveBookings, Role.CategorisationSecurity])(req, res, next)
      expect(req.middleware.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(2)
      expect(next).toHaveBeenCalledWith(new RoleError('CheckHasSomeRolesMiddleware: not authorised for test/path'))
      expect(next).toHaveBeenCalledWith()
    })
  })
})
