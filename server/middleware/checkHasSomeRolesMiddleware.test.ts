import { NextFunction, Request, Response } from 'express'
import checkHasSomeRoles from './checkHasSomeRolesMiddleware'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import RoleError from '../utils/roleError'

let req: Request
let res: Response
let next: NextFunction

describe('CheckHasSomeRolesMiddleware', () => {
  beforeEach(() => {
    req = {
      params: { prisonerNumber: 'G6123VU' },
      path: 'test/path',
      middleware: {
        clientToken: 'CLIENT_TOKEN',
      },
    } as unknown as Request
    res = {
      locals: {
        user: {
          activeCaseLoadId: 'MDI',
          userRoles: [Role.PomUser, Role.ReceptionUser],
          caseLoads: CaseLoadsDummyDataA,
        },
      },
      render: jest.fn(),
    } as unknown as Response
    next = jest.fn()
  })

  it('should return next() on success', async () => {
    await checkHasSomeRoles([Role.PomUser, Role.ReceptionUser])(req, res, next)
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
      await checkHasSomeRoles([Role.InactiveBookings, Role.CategorisationSecurity])(req, res, next)
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
      await checkHasSomeRoles([Role.InactiveBookings, Role.CategorisationSecurity])(req, res, next)
      expect(req.middleware.errors).toBeUndefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith(new RoleError('CheckHasSomeRolesMiddleware: not authorised for test/path'))
    })
  })
})
