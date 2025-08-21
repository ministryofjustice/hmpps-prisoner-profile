import { NextFunction } from 'express'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { parameterGuard } from './parameterGuard'
import NotFoundError from '../utils/notFoundError'

describe('Parameter guard middleware', () => {
  const req: any = {
    params: { one: 'value1', two: 'value2' },
    path: 'test/path',
    middleware: {
      clientToken: 'CLIENT_TOKEN',
      prisonerData: { ...PrisonerMockDataA, prisonId: 'TRN' },
    },
  }
  const res: any = {}
  let next: NextFunction

  beforeEach(() => {
    next = jest.fn()
  })

  it('Should allow valid parameter values', () => {
    parameterGuard('one', ['value1'])(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
  })

  it.each([
    ['The parameter does not exist', 'three', ['value3']],
    ['The value is not in the list of accepted values', 'one', ['value2']],
    ['The list of accepted values is empty', 'one', []],
  ])('Should send a not found error when: %s', async (label, parameterName, acceptedValues) => {
    const value = req.params?.[parameterName]
    await parameterGuard(parameterName, acceptedValues)(req, res, next)

    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith(
      new NotFoundError(`Value ${value} is not supported for parameter ${parameterName}`),
    )
  })
})
