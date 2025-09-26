import { NextFunction, Request, Response } from 'express'
import { saveBackLink } from './backLinkController'
import config from '../config'

describe('Back Link Controller', () => {
  const next: NextFunction = jest.fn()

  it('should save back link to session', () => {
    const req = {
      query: {
        service: 'welcome-people-into-prison',
        returnPath: '/return-path',
        redirectPath: '/prisoner/Q1234QQ/case-notes',
        backLinkText: 'Back link text',
      },
      session: {},
      flash: jest.fn(),
    } as unknown as Request
    const res = {
      redirect: jest.fn(),
    } as unknown as Response
    saveBackLink()(req, res, next)

    expect(req.session.userBackLink).toEqual({
      url: `${config.serviceUrls.welcomePeopleIntoPrison}/return-path`,
      text: 'Back link text',
    })
    expect(res.redirect).toHaveBeenCalled()
  })

  it('should save back link to flash when called from WPIP directly to add case note', () => {
    const req = {
      query: {
        service: 'welcome-people-into-prison',
        returnPath: '/return-path',
        redirectPath: '/prisoner/Q1234QQ/add-case-note',
        backLinktext: 'Back link text',
      },
      flash: jest.fn(),
    } as unknown as Request
    const res = {
      redirect: jest.fn(),
    } as unknown as Response
    saveBackLink()(req, res, next)

    expect(req.flash).toHaveBeenCalled()
    expect(res.redirect).toHaveBeenCalled()
  })

  it('should throw error if required params are missing', async () => {
    const req = {
      query: {},
      flash: jest.fn(),
    } as unknown as Request
    const res = {
      redirect: jest.fn(),
    } as unknown as Response

    await expect(saveBackLink()(req, res, next)).rejects.toThrow('Required query parameters missing')

    expect(req.flash).not.toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
  })

  it('should throw error if invalid service', async () => {
    const req = {
      query: {
        service: 'invalid-service',
        returnPath: '/return-path',
        redirectPath: '/prisoner/Q1234QQ/add-case-note',
        backLinktext: 'Back link text',
      },
      flash: jest.fn(),
    } as unknown as Request
    const res = {
      redirect: jest.fn(),
    } as unknown as Response

    await expect(saveBackLink()(req, res, next)).rejects.toThrow('Could not find service: [invalid-service]')

    expect(req.flash).not.toHaveBeenCalled()
    expect(res.redirect).not.toHaveBeenCalled()
  })
})
