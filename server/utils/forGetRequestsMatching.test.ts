import { Request, Response } from 'express'
import forGetRequestsMatching from './forGetRequestsMatching'

describe('forGetRequestsMatching', () => {
  it('Calls the middleware given a GET request and a single true check', () => {
    const middlewareSpy = jest.fn()
    const nextSpy = jest.fn()
    const check = jest.fn(() => true)
    const req = { path: 'path', method: 'GET' } as Request

    forGetRequestsMatching([check], middlewareSpy)(req, {} as Response, nextSpy)

    expect(check).toHaveBeenCalledWith('path')
    expect(middlewareSpy).toHaveBeenCalledWith(req, {}, nextSpy)
    expect(nextSpy).not.toHaveBeenCalled()
  })

  it('Calls the middleware given a GET request with a true check alongside a false check', () => {
    const middlewareSpy = jest.fn()
    const nextSpy = jest.fn()
    const checkFalse = jest.fn(() => false)
    const checkTrue = jest.fn(() => true)
    const req = { path: 'path', method: 'GET' } as Request

    forGetRequestsMatching([checkFalse, checkTrue], middlewareSpy)(req, {} as Response, nextSpy)

    expect(checkFalse).toHaveBeenCalledWith('path')
    expect(checkTrue).toHaveBeenCalledWith('path')
    expect(middlewareSpy).toHaveBeenCalledWith(req, {}, nextSpy)
    expect(nextSpy).not.toHaveBeenCalled()
  })

  it('Skips the middleware and calls next given a GET request with all false checks', () => {
    const middlewareSpy = jest.fn()
    const nextSpy = jest.fn()
    const check = jest.fn(() => false)
    const checkTwo = jest.fn(() => false)
    const req = { path: 'path', method: 'GET' } as Request

    forGetRequestsMatching([check, checkTwo], middlewareSpy)(req, {} as Response, nextSpy)

    expect(check).toHaveBeenCalledWith('path')
    expect(checkTwo).toHaveBeenCalledWith('path')
    expect(middlewareSpy).not.toHaveBeenCalled()
    expect(nextSpy).toHaveBeenCalled()
  })

  it('Skips the middleware and calls next given a GET request with an empty checks array', () => {
    const middlewareSpy = jest.fn()
    const nextSpy = jest.fn()
    const req = { path: 'path', method: 'GET' } as Request

    forGetRequestsMatching([], middlewareSpy)(req, {} as Response, nextSpy)

    expect(middlewareSpy).not.toHaveBeenCalled()
    expect(nextSpy).toHaveBeenCalled()
  })

  it('Short-circuits and does not run further checks once one returns true', () => {
    const middlewareSpy = jest.fn()
    const nextSpy = jest.fn()
    const checkTrue = jest.fn(() => true)
    const checkNotCalled = jest.fn(() => false)
    const req = { path: 'path', method: 'GET' } as Request

    forGetRequestsMatching([checkTrue, checkNotCalled], middlewareSpy)(req, {} as Response, nextSpy)

    expect(checkTrue).toHaveBeenCalledWith('path')
    expect(checkNotCalled).not.toHaveBeenCalled()
    expect(middlewareSpy).toHaveBeenCalled()
    expect(nextSpy).not.toHaveBeenCalled()
  })

  it.each(['POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'])(
    'Skips the middleware and calls next for a %s request even when a check would match',
    method => {
      const middlewareSpy = jest.fn()
      const nextSpy = jest.fn()
      const check = jest.fn(() => true)
      const req = { path: 'path', method } as Request

      forGetRequestsMatching([check], middlewareSpy)(req, {} as Response, nextSpy)

      expect(middlewareSpy).not.toHaveBeenCalled()
      expect(nextSpy).toHaveBeenCalled()
    },
  )

  it('Does not evaluate any checks when the request method is not GET', () => {
    const middlewareSpy = jest.fn()
    const nextSpy = jest.fn()
    const check = jest.fn(() => true)
    const req = { path: 'path', method: 'POST' } as Request

    forGetRequestsMatching([check], middlewareSpy)(req, {} as Response, nextSpy)

    expect(check).not.toHaveBeenCalled()
    expect(middlewareSpy).not.toHaveBeenCalled()
    expect(nextSpy).toHaveBeenCalled()
  })
})
