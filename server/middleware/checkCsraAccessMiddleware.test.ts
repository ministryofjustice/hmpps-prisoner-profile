import { NextFunction, Request, Response } from 'express'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataB } from '../data/localMockData/caseLoad'
import RoleError from '../utils/roleError'
import checkCsraAccess from './checkCsraAccessMiddleware'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'

let req: Request
let res: Response
let next: NextFunction

describe('CheckCsraAccessMiddleware', () => {
  beforeEach(() => {
    req = {
      params: { prisonerNumber: 'G6123VU' },
      path: 'test/path',
      middleware: {
        clientToken: 'CLIENT_TOKEN',
        prisonerData: { ...PrisonerMockDataA, prisonId: 'TRN' },
      },
    } as unknown as Request
    res = {
      locals: {
        user: {
          activeCaseLoadId: 'ZZZ',
          userRoles: [Role.PrisonUser, Role.GlobalSearch],
          caseLoads: CaseLoadsDummyDataB,
        },
      },
      render: jest.fn(),
    } as unknown as Response
    next = jest.fn()
  })

  it('should return next() on success', async () => {
    await checkCsraAccess()(req, res, next)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
  })

  it('should return next(error) on fail', async () => {
    res.locals.user.userRoles = []
    await checkCsraAccess()(req, res, next)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(new RoleError('CheckCsraAccessMiddleware: not authorised for test/path'))
  })
})
