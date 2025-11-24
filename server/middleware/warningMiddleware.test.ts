import { Request, Response } from 'express'
import { warningMiddleware, warningRenderMiddleware } from './warningMiddleware'
import { NomisLockedError } from '../utils/nomisLockedError'
import MetricsService from '../services/metrics/metricsService'
import ProblemSavingError from '../utils/problemSavingError'

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

    warningMiddleware(metricsService)(err, req, res, next)

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

  it('should flash problemSaving and the request body then redirect when ProblemSavingError happens', () => {
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

    const err = new ProblemSavingError('Issue making call to save user input')
    const next = jest.fn()

    warningMiddleware(null)(err, req, res, next)

    expect(req.flash).toHaveBeenCalledWith('problemSaving', 'true')
    expect(req.flash).toHaveBeenCalledWith('requestBody', JSON.stringify(req.body))
    expect(res.redirect).toHaveBeenCalledWith('/somePage')
    expect(next).not.toHaveBeenCalled()
  })

  it('should call next with the error for arbitrary errors', () => {
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

    warningMiddleware(metricsService)(err, req, res, next)

    expect(req.flash).not.toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
    expect(next).toHaveBeenCalledWith(err)
    expect(metricsService.trackNomisLockedWarning).not.toHaveBeenCalled()
  })
})

describe('warningRenderMiddleware', () => {
  it('should patch res.render to include isLocked and problemSaving flags', () => {
    const req = {
      flash: jest.fn().mockReturnValue(['true']),
    } as unknown as Request

    const originalRender = jest.fn()
    const res = {
      render: originalRender,
    } as unknown as Response

    const next = jest.fn()

    warningRenderMiddleware(req, res, next)

    const patchedRender = res.render as jest.Mock

    const options = { some: 'option' }
    const callback = jest.fn()

    patchedRender('someView', options, callback)

    expect(originalRender).toHaveBeenCalledWith(
      'someView',
      { ...options, isLocked: true, problemSaving: true },
      callback,
    )
    expect(next).toHaveBeenCalled()
  })
})
