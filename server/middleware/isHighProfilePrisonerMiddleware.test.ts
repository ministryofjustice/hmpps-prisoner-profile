import { BadRequest, InternalServerError } from 'http-errors'
import type { NextFunction, Request, Response } from 'express'
import config from '../config'
import type { Services } from '../services'
import { isHighProfilePrisonerMiddleware } from './isHighProfilePrisonerMiddleware'
import { permissionsApiClientMock } from '../../tests/mocks/permissionsApiClientMock'

const prisonerNumber = 'G6123VU'

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
    req = { middleware: { clientToken: 'tok' }, params: { prisonerNumber } } as unknown as Request
    res = { locals: {} } as Response
    next = jest.fn() as NextFunction
  })

  it('should be disabled by default', async () => {
    await expect(middleware(req, res, next)).resolves.toBeUndefined()

    expect(permissionsApiClient.checkHighProfilePrisonerStatus).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith()
    expect(res.locals.isHighProfilePrisoner).toBeUndefined()
  })

  describe('when enabled', () => {
    beforeEach(() => {
      config.featureToggles.highProfilePrisonersEnabled = true
    })

    it('should require a prisoner number', async () => {
      delete req.params.prisonerNumber

      await expect(middleware(req, res, next)).rejects.toThrow('Usage error')

      expect(permissionsApiClient.checkHighProfilePrisonerStatus).not.toHaveBeenCalled()
      expect(next).not.toHaveBeenCalled()
      expect(res.locals.isHighProfilePrisoner).toBeUndefined()
    })

    it.each([true, false])('should flag high profile prisoners when %s', async isHighProfilePrisoner => {
      permissionsApiClient.checkHighProfilePrisonerStatus.mockResolvedValue(isHighProfilePrisoner)

      await expect(middleware(req, res, next)).resolves.toBeUndefined()

      expect(permissionsApiClient.checkHighProfilePrisonerStatus).toHaveBeenCalledWith(prisonerNumber)
      expect(next).toHaveBeenCalledWith()
      expect(res.locals.isHighProfilePrisoner).toBe(isHighProfilePrisoner)
    })

    it.each([new BadRequest(), new InternalServerError()])(
      'should propagate $message from the permissions api to prevent inadvertent access',
      async error => {
        permissionsApiClient.checkHighProfilePrisonerStatus.mockRejectedValue(error)

        await expect(middleware(req, res, next)).rejects.toThrow(error.message)

        expect(permissionsApiClient.checkHighProfilePrisonerStatus).toHaveBeenCalledWith(prisonerNumber)
        expect(next).not.toHaveBeenCalled()
        expect(res.locals.isHighProfilePrisoner).toBeUndefined()
      },
    )
  })
})
