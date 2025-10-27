import { NextFunction, Request, Response } from 'express'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataB } from '../data/localMockData/caseLoad'
import RoleError from '../utils/roleError'
import checkPrisonerIsInUsersCaseloads from './checkPrisonerIsInUsersCaseloadsMiddleware'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'

let req: Request
let res: Response
let next: NextFunction

describe('CheckPrisonerIsInUsersCaseloadsMiddleware', () => {
  beforeEach(() => {
    req = {
      params: { prisonerNumber: 'G6123VU' },
      path: 'test/path',
      middleware: {
        clientToken: 'CLIENT_TOKEN',
        prisonerData: { ...PrisonerMockDataA, prisonId: 'BAI' },
      },
    } as unknown as Request
    res = {
      locals: {
        user: {
          activeCaseLoadId: 'ZZZ',
          userRoles: [],
          caseLoads: CaseLoadsDummyDataB,
          authSource: 'nomis',
        },
      },
      render: jest.fn(),
    } as unknown as Response
    next = jest.fn()
  })

  it('should allow user with correct caseload', async () => {
    await checkPrisonerIsInUsersCaseloads()(req, res, next)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
  })

  it('should not allow user without correct caseload', async () => {
    req.middleware.prisonerData.prisonId = 'ZZZ'
    await checkPrisonerIsInUsersCaseloads()(req, res, next)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(
      new RoleError('CheckPrisonerIsInUsersCaseloadsMiddleware: not authorised for test/path'),
    )
  })

  it('should allow user with global search role to view transferring prisoner', async () => {
    req.middleware.prisonerData.prisonId = 'TRN'
    res.locals.user.userRoles = [Role.GlobalSearch]
    await checkPrisonerIsInUsersCaseloads()(req, res, next)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
  })

  it('should not allow user without global search role to view transferring prisoner', async () => {
    req.middleware.prisonerData.prisonId = 'TRN'
    await checkPrisonerIsInUsersCaseloads()(req, res, next)
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(
      new RoleError('CheckPrisonerIsInUsersCaseloadsMiddleware: not authorised for test/path'),
    )
  })
})
