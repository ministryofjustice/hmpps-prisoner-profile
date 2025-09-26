import { NextFunction, Request, Response } from 'express'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import NotFoundError from '../utils/notFoundError'
import { prisonerNumberGuard } from './prisonerNumberGuard'

describe('Prisoner number guard middleware', () => {
  const req = {
    params: { prisonerNumber: 'A1234AA' },
    path: 'test/path',
    middleware: {
      clientToken: 'CLIENT_TOKEN',
      prisonerData: { ...PrisonerMockDataA, prisonId: 'TRN' },
    },
  } as unknown as Request
  const res = {} as Response
  let next: NextFunction

  beforeEach(() => {
    next = jest.fn()
  })

  it('Should allow valid prisoner numbers', () => {
    prisonerNumberGuard()(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
  })

  it.each([[undefined], [null], [''], [' '], ['A12345A'], ['A1234AAA'], ['A1234A']])(
    'Should send a not found error for invalid prisoner numbers: %s',
    async prisonerNumber => {
      const invalidReq = {
        ...req,
        params: {
          prisonerNumber,
        },
      } as unknown as Request
      await prisonerNumberGuard()(invalidReq, res, next)

      expect(next).toHaveBeenCalledTimes(1)
      expect(next).toHaveBeenCalledWith(new NotFoundError(`Value ${prisonerNumber} is not a valid prisoner number`))
    },
  )
})
