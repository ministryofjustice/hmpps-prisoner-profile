import { NextFunction } from 'express'
import checkHasAllRoles from './checkHasAllRolesMiddleware'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import RoleError from '../utils/roleError'

let req: any
let res: any
let next: NextFunction

describe('CheckHasAllRolesMiddleware', () => {
  beforeEach(() => {
    req = {
      params: { prisonerNumber: 'G6123VU' },
      path: 'test/path',
      middleware: {
        clientToken: 'CLIENT_TOKEN',
      },
    }
    res = {
      locals: {
        user: {
          activeCaseLoadId: 'MDI',
          userRoles: [Role.PomUser, Role.ReceptionUser],
          caseLoads: CaseLoadsDummyDataA,
        },
      },
      render: jest.fn(),
    }
    next = jest.fn()
  })

  it('should return next() on success', async () => {
    await checkHasAllRoles([Role.PomUser, Role.ReceptionUser])(req, res, next)
    expect(req.middleware.errors).toBeUndefined()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
  })

  describe('Used inside GuardMiddleware', () => {
    beforeEach(() => {
      req.middleware = {
        usingGuard: 1,
      }
    })

    it('should populate middleware.errors on fail', async () => {
      await checkHasAllRoles([Role.PomUser, Role.CategorisationSecurity])(req, res, next)
      expect(req.middleware.errors).toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith('route')
    })
  })

  describe('Used outside GuardMiddleware', () => {
    beforeEach(() => {
      req.middleware = {
        usingGuard: 0,
      }
    })

    it('should return next(error) on fail', async () => {
      await checkHasAllRoles([Role.PomUser, Role.CategorisationSecurity])(req, res, next)
      expect(req.middleware.errors).toBeUndefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith(new RoleError('CheckHasAllRolesMiddleware: not authorised for test/path'))
    })
  })
})
