import { BadRequest, InternalServerError } from 'http-errors'
import type { NextFunction, Request, Response } from 'express'
import config from '../config'
import type { Services } from '../services'
import { isHighProfilePrisonerMiddleware } from './isHighProfilePrisonerMiddleware'
import type Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { CaseLoadsDummyDataB } from '../data/localMockData/caseLoad'
import { PrisonerMockDataA as prisonerMock } from '../data/localMockData/prisoner'
import { azureUserMock, externalUserMock, prisonUserMock, probationUserMock } from '../data/localMockData/user'
import { permissionsApiClientMock } from '../../tests/mocks/permissionsApiClientMock'

const prisonUserWithDifferentCaseloadsMock = {
  ...prisonUserMock,
  activeCaseLoadId: 'BAI',
  caseLoads: CaseLoadsDummyDataB,
}

const { prisonerNumber } = prisonerMock
const prisonerInTransferMock: Prisoner = { ...prisonerMock, inOutStatus: 'TRN', prisonId: 'TRN' }
const releasedPrisonerMock: Prisoner = { ...prisonerMock, inOutStatus: 'OUT', prisonId: 'OUT' }
const prisonerWithoutLocationMock: Prisoner = { ...prisonerMock, inOutStatus: undefined, prisonId: undefined }

describe('isHighProfilePrisonerMiddleware', () => {
  const permissionsApiClient = permissionsApiClientMock()
  const middleware = isHighProfilePrisonerMiddleware({
    dataAccess: { permissionsApiClientBuilder: () => permissionsApiClient },
  } as unknown as Services)

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
    req = { middleware: { clientToken: 'tok', prisonerData: prisonerMock } } as unknown as Request
    res = { locals: { user: prisonUserMock } } as Response
    next = jest.fn() as NextFunction
  })

  it('should be disabled by default', async () => {
    await expect(middleware(req, res, next)).resolves.toBeUndefined()

    expect(permissionsApiClient.checkHighProfilePrisonerStatus).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith()
    expect(res.locals.isHighProfilePrisoner).toBeUndefined()
    expect(res.locals.isHighProfilePrisonerOutsideCaseloads).toBeUndefined()
  })

  describe('when enabled', () => {
    beforeEach(() => {
      config.featureToggles.highProfilePrisonersEnabled = true
    })

    it('should require prisoner data middleware', async () => {
      delete req.middleware.prisonerData

      await expect(middleware(req, res, next)).rejects.toThrow('Usage error')

      expect(permissionsApiClient.checkHighProfilePrisonerStatus).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(res.locals.isHighProfilePrisoner).toBeUndefined()
      expect(res.locals.isHighProfilePrisonerOutsideCaseloads).toBeUndefined()
    })

    describe('high-profile prisoners', () => {
      beforeAll(() => {
        permissionsApiClient.checkHighProfilePrisonerStatus.mockResolvedValue(true)
      })

      it.each([
        { scenario: 'prison users when in their caseloads', user: prisonUserMock },
        { scenario: 'Azure AD / Entra ID users', user: azureUserMock },
        { scenario: 'external users', user: externalUserMock },
        { scenario: 'probation users', user: probationUserMock },
      ])('should be flagged to $scenario', async ({ user }) => {
        res.locals.user = user

        await expect(middleware(req, res, next)).resolves.toBeUndefined()

        expect(permissionsApiClient.checkHighProfilePrisonerStatus).toHaveBeenCalledWith(prisonerNumber)
        expect(next).toHaveBeenCalledWith()
        expect(res.locals.isHighProfilePrisoner).toBe(true)
        expect(res.locals.isHighProfilePrisonerOutsideCaseloads).toBe(false)
      })

      it('should be flagged to prison users when not in their caseloads', async () => {
        res.locals.user = prisonUserWithDifferentCaseloadsMock

        await expect(middleware(req, res, next)).resolves.toBeUndefined()

        expect(permissionsApiClient.checkHighProfilePrisonerStatus).toHaveBeenCalledWith(prisonerNumber)
        expect(next).toHaveBeenCalledWith()
        expect(res.locals.isHighProfilePrisoner).toBe(true)
        expect(res.locals.isHighProfilePrisonerOutsideCaseloads).toBe(true)
      })

      describe.each([
        { scenario: 'who are being transferred', prisoner: prisonerInTransferMock },
        { scenario: 'who were released', prisoner: releasedPrisonerMock },
        { scenario: 'who do not have a prison set', prisoner: prisonerWithoutLocationMock },
      ])('$scenario', ({ prisoner }) => {
        beforeEach(() => {
          req.middleware.prisonerData = prisoner
        })

        it.each([
          { scenario: 'prison users when in their caseloads', user: prisonUserMock },
          { scenario: 'Azure AD / Entra ID users', user: azureUserMock },
          { scenario: 'external users', user: externalUserMock },
          { scenario: 'probation users', user: probationUserMock },
        ])('should be flagged to $scenario', async ({ user }) => {
          res.locals.user = user

          await expect(middleware(req, res, next)).resolves.toBeUndefined()

          expect(permissionsApiClient.checkHighProfilePrisonerStatus).toHaveBeenCalledWith(prisonerNumber)
          expect(next).toHaveBeenCalledWith()
          expect(res.locals.isHighProfilePrisoner).toBe(true)
          expect(res.locals.isHighProfilePrisonerOutsideCaseloads).toBe(false)
        })
      })
    })

    describe('prisoners who are not high-profile', () => {
      beforeAll(() => {
        permissionsApiClient.checkHighProfilePrisonerStatus.mockResolvedValue(false)
      })

      it.each([
        { scenario: 'prison users when in their caseloads', user: prisonUserMock },
        { scenario: 'prison users when not in their caseloads', user: prisonUserWithDifferentCaseloadsMock },
        { scenario: 'Azure AD / Entra ID users', user: azureUserMock },
        { scenario: 'external users', user: externalUserMock },
        { scenario: 'probation users', user: probationUserMock },
      ])('should not be flagged to $scenario', async ({ user }) => {
        res.locals.user = user

        await expect(middleware(req, res, next)).resolves.toBeUndefined()

        expect(permissionsApiClient.checkHighProfilePrisonerStatus).toHaveBeenCalledWith(prisonerNumber)
        expect(next).toHaveBeenCalledWith()
        expect(res.locals.isHighProfilePrisoner).toBe(false)
        expect(res.locals.isHighProfilePrisonerOutsideCaseloads).toBe(false)
      })
    })

    it.each([new BadRequest(), new InternalServerError()])(
      'should propagate $message from the permissions api to prevent inadvertent access',
      async error => {
        permissionsApiClient.checkHighProfilePrisonerStatus.mockRejectedValue(error)

        await expect(middleware(req, res, next)).rejects.toThrow(error.message)

        expect(permissionsApiClient.checkHighProfilePrisonerStatus).toHaveBeenCalledWith(prisonerNumber)
        expect(next).not.toHaveBeenCalled()
        expect(res.locals.isHighProfilePrisoner).toBeUndefined()
        expect(res.locals.isHighProfilePrisonerOutsideCaseloads).toBeUndefined()
      },
    )
  })
})
