import { Request, Response } from 'express'
import { nomisLockedMiddleware, nomisLockedRenderMiddleware } from './nomisLockedMiddleware'
import { NomisLockedError } from '../utils/nomisLockedError'
import MetricsService from '../services/metrics/metricsService'

describe('nomisLockedMiddleware', () => {
  it('should flash isLocked, call the metricsService, and redirect when NomisLockedError happens', () => {
    const req = {
      flash: jest.fn(),
      body: { foo: 'bar' },
      originalUrl: '/somePage',
      middleware: { prisonerData: { prisonerNumber: 'A1234BC' } },
    } as unknown as Request

    const res = {
      redirect: jest.fn(),
      locals: { user: {} },
    } as unknown as Response

    const err = new NomisLockedError('Resource Locked', '/someApiEndpoint')
    const next = jest.fn()

    const metricsService = {
      trackNomisLockedWarning: jest.fn(),
    } as unknown as MetricsService

    nomisLockedMiddleware(metricsService)(err, req, res, next)

    expect(req.flash).toHaveBeenCalledWith('isLocked', 'true')
    expect(req.flash).toHaveBeenCalledWith('requestBody', JSON.stringify(req.body))
    expect(res.redirect).toHaveBeenCalledWith('/somePage')
    expect(next).not.toHaveBeenCalled()
    expect(metricsService.trackNomisLockedWarning).toHaveBeenCalledWith(
      'A1234BC',
      '/somePage',
      '/someApiEndpoint',
      res.locals.user,
    )
  })

  it('should call next with error if not a NomisLockedError', () => {
    const req = {
      flash: jest.fn(),
      body: {},
    } as unknown as Request

    const res = {
      redirect: jest.fn(),
    } as unknown as Response

    const err = new Error('Some other error')
    const next = jest.fn()

    const metricsService = {
      trackNomisLockedWarning: jest.fn(),
    } as unknown as MetricsService

    nomisLockedMiddleware(metricsService)(err, req, res, next)

    expect(req.flash).not.toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(err)
    expect(metricsService.trackNomisLockedWarning).not.toHaveBeenCalled()
  })
})

describe('nomisLockedRenderMiddleware', () => {
  it('should patch res.render to include isLocked flag', () => {
    const req = {
      flash: jest.fn().mockReturnValue(['true']),
    } as unknown as Request

    const originalRender = jest.fn()
    const res = {
      render: originalRender,
    } as unknown as Response

    const next = jest.fn()

    nomisLockedRenderMiddleware(req, res, next)

    const patchedRender = res.render as jest.Mock

    const options = { some: 'option' }
    const callback = jest.fn()

    patchedRender('someView', options, callback)

    expect(originalRender).toHaveBeenCalledWith('someView', { ...options, isLocked: true }, callback)
    expect(next).toHaveBeenCalled()
  })

  it('should not patch res.render if isLocked flag is not set', () => {
    const req = {
      flash: jest.fn().mockReturnValue(['false']),
    } as unknown as Request

    const originalRender = jest.fn()
    const res = {
      render: originalRender,
    } as unknown as Response

    const next = jest.fn()

    nomisLockedRenderMiddleware(req, res, next)

    const options = { a: 1 }
    const callback = jest.fn()

    res.render('someView', options, callback)

    expect(originalRender).toHaveBeenCalledWith('someView', options, callback)
    expect(next).toHaveBeenCalled()
  })
})
