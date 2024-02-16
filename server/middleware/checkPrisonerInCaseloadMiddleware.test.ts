import { NextFunction } from 'express'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import checkPrisonerInCaseload from './checkPrisonerInCaseloadMiddleware'
import ServerError from '../utils/serverError'
import NotFoundError from '../utils/notFoundError'
import { Services } from '../services'
import { DataAccess } from '../data'
import { restrictedPatientMock } from '../data/localMockData/restrictedPatientApi/restrictedPatient'
import { RestrictedPatientApiClient } from '../data/interfaces/restrictedPatientApiClient'

let req: any
let res: any
let next: NextFunction

describe('CheckPrisonerInCaseloadMiddleware', () => {
  let services: Services

  beforeEach(() => {
    services = {} as Services

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

    await checkPrisonerInCaseload(services)(req, res, next)
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

      await checkPrisonerInCaseload(services)(req, res, next)
      expect(req.middleware.errors).toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith('route')
    })

    it('should add middleware error if inactive booking and allowInactive is false', async () => {
      req.middleware.prisonerData.prisonId = 'OUT'

      await checkPrisonerInCaseload(services, { allowInactive: false })(req, res, next)
      expect(req.middleware.errors).toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith('route')
    })

    it('should return next() if inactive booking and user does have role', async () => {
      req.middleware.prisonerData.prisonId = 'OUT'
      res.locals.user.userRoles = [Role.InactiveBookings]

      await checkPrisonerInCaseload(services)(req, res, next)
      expect(req.middleware?.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
    })

    it('should return next() if inactive booking and allowInactive is true and user has role', async () => {
      req.middleware.prisonerData.prisonId = 'OUT'
      res.locals.user.userRoles = [Role.InactiveBookings]

      await checkPrisonerInCaseload(services)(req, res, next)
      expect(req.middleware?.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
    })

    it('should add middleware error if prisoner not in caseload and user does not have global search role', async () => {
      req.middleware.prisonerData.prisonId = 'ZZZ'

      await checkPrisonerInCaseload(services)(req, res, next)
      expect(req.middleware.errors).toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith('route')
    })

    it('should add middleware error if prisoner not in caseload and allowGlobal is false', async () => {
      req.middleware.prisonerData.prisonId = 'ZZZ'

      await checkPrisonerInCaseload(services, { allowGlobal: false })(req, res, next)
      expect(req.middleware.errors).toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith('route')
    })

    it('should return next() if prisoner not in caseload and allowGlobal is true and user has role', async () => {
      req.middleware.prisonerData.prisonId = 'ZZZ'
      res.locals.user.userRoles = [Role.GlobalSearch]

      await checkPrisonerInCaseload(services)(req, res, next)
      expect(req.middleware?.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
    })
  })

  describe('Used outside GuardMiddleware', () => {
    it('should return NotFoundError if inactive booking and user does not have role', async () => {
      req.middleware.prisonerData.prisonId = 'OUT'

      await checkPrisonerInCaseload(services)(req, res, next)
      expect(req.middleware.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith(
        new NotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner is inactive [OUT]'),
      )
    })

    it('should return NotFoundError if inactive booking and allowInactive is false', async () => {
      req.middleware.prisonerData.prisonId = 'OUT'

      await checkPrisonerInCaseload(services, { allowInactive: false })(req, res, next)
      expect(req.middleware.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith(
        new NotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner is inactive [OUT]'),
      )
    })

    it('should return next() if inactive booking and user does have role', async () => {
      req.middleware.prisonerData.prisonId = 'OUT'
      res.locals.user.userRoles = [Role.InactiveBookings]

      await checkPrisonerInCaseload(services)(req, res, next)
      expect(req.middleware?.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
    })

    it('should return next() if inactive booking and allowInactive is true and user has role', async () => {
      req.middleware.prisonerData.prisonId = 'OUT'
      res.locals.user.userRoles = [Role.InactiveBookings]

      await checkPrisonerInCaseload(services)(req, res, next)
      expect(req.middleware?.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
    })

    it('should return NotFoundError if prisoner not in caseload and user does not have global search role', async () => {
      req.middleware.prisonerData.prisonId = 'ZZZ'

      await checkPrisonerInCaseload(services)(req, res, next)
      expect(req.middleware.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith(
        new NotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner not in caseloads'),
      )
    })

    it('should return NotFoundError if prisoner not in caseload and allowGlobal is false', async () => {
      req.middleware.prisonerData.prisonId = 'ZZZ'

      await checkPrisonerInCaseload(services, { allowGlobal: false })(req, res, next)
      expect(req.middleware.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith(
        new NotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner not in caseloads'),
      )
    })

    it('should return next() if prisoner not in caseload and allowGlobal is true and user has role', async () => {
      req.middleware.prisonerData.prisonId = 'ZZZ'
      res.locals.user.userRoles = [Role.GlobalSearch]

      await checkPrisonerInCaseload(services)(req, res, next)
      expect(req.middleware?.errors).not.toBeDefined()
      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith()
    })
  })

  describe('Restricted patients', () => {
    let restrictedPatientApi: RestrictedPatientApiClient
    beforeEach(() => {
      restrictedPatientApi = {
        getRestrictedPatient: jest.fn(async () => restrictedPatientMock),
      }

      req.middleware.prisonerData.restrictedPatient = true
      services.dataAccess = {
        restrictedPatientApiClientBuilder: (_: string) => restrictedPatientApi,
      } as DataAccess
    })

    it('Does not let users view a restricted patient without a POM role', async () => {
      res.locals.user.userRoles = [Role.PrisonUser]
      await checkPrisonerInCaseload(services)(req, res, next)
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

      it('Gets restricted patient information from the API', async () => {
        await checkPrisonerInCaseload(services)(req, res, next)
        expect(restrictedPatientApi.getRestrictedPatient).toHaveBeenCalledWith(PrisonerMockDataA.prisonerNumber)
      })

      it('Does not let users view a patient without the supporting prison caseload', async () => {
        await checkPrisonerInCaseload(services)(req, res, next)
        expect(req.middleware.errors).not.toBeDefined()
        expect(next).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith(
          new NotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner is restricted patient'),
        )
      })

      it('Does not let users view a patient without the supporting prison being active', async () => {
        res.locals.user.caseLoads[0].caseLoadId = 'LEI'
        restrictedPatientApi.getRestrictedPatient = jest.fn(async () => ({
          ...restrictedPatientMock,
          supportingPrison: { agencyId: 'LEI', active: false },
        }))

        await checkPrisonerInCaseload(services)(req, res, next)
        expect(req.middleware.errors).not.toBeDefined()
        expect(next).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith(
          new NotFoundError('CheckPrisonerInCaseloadMiddleware: Prisoner is restricted patient'),
        )
      })

      it('Lets users view a patient with the active supporting prison', async () => {
        res.locals.user.caseLoads[0].caseLoadId = 'LEI'
        restrictedPatientApi.getRestrictedPatient = jest.fn(async () => ({
          ...restrictedPatientMock,
          supportingPrison: { agencyId: 'LEI', active: true },
        }))

        await checkPrisonerInCaseload(services)(req, res, next)
        expect(req.middleware.errors).not.toBeDefined()
        expect(next).toHaveBeenCalledTimes(1)
        expect(next).toHaveBeenCalledWith()
      })
    })
  })
})
