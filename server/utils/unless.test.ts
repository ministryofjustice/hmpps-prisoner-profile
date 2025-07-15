import { Request, Response } from 'express'
import unless from './unless'

describe('Unless', () => {
  it('Successfully skips the middleware given a single true check', () => {
    const middlewareSpy = jest.fn()
    const nextSpy = jest.fn()
    const check = jest.fn(() => true)

    unless([check], middlewareSpy)({ path: 'path' } as Request, {} as Response, nextSpy)
    expect(check).toHaveBeenCalledWith('path')
    expect(nextSpy).toHaveBeenCalled()
    expect(middlewareSpy).not.toHaveBeenCalled()
  })

  it('Successfully skips the middleware given a single true check with another false check', () => {
    const middlewareSpy = jest.fn()
    const nextSpy = jest.fn()
    const check = jest.fn(() => true)
    const checkFalse = jest.fn(() => false)

    unless([checkFalse, check], middlewareSpy)({ path: 'path' } as Request, {} as Response, nextSpy)
    expect(checkFalse).toHaveBeenCalledWith('path')
    expect(check).toHaveBeenCalledWith('path')
    expect(nextSpy).toHaveBeenCalled()
    expect(middlewareSpy).not.toHaveBeenCalled()
  })

  it('Successfully calls the middleware given all false checks', () => {
    const middlewareSpy = jest.fn()
    const nextSpy = jest.fn()
    const check = jest.fn(() => false)
    const checkTwo = jest.fn(() => false)

    unless([check, checkTwo], middlewareSpy)({ path: 'path' } as Request, {} as Response, nextSpy)
    expect(check).toHaveBeenCalledWith('path')
    expect(checkTwo).toHaveBeenCalledWith('path')
    expect(nextSpy).not.toHaveBeenCalled()
    expect(middlewareSpy).toHaveBeenCalled()
  })
})
