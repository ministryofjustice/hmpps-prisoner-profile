import type { NextFunction, Request, Response } from 'express'
import config from '../config'
import { JustifyAccessController } from './justifyAccessController'

const prisonerNumber = 'G6123VU'
const originalUrl = `/prisoner/${prisonerNumber}/alerts/active?sort=dateCreated%2CASC`

describe('Justify access controller', () => {
  const controller = new JustifyAccessController()

  const flash = jest.fn() as jest.Mock<Request['flash']>
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
    req = {
      method: 'GET',
      originalUrl,
      session: {},
      body: undefined,
      errors: undefined,
      flash,
    } as unknown as Request
    res = {
      locals: {
        prisonerNumber,
        isHighProfilePrisoner: undefined,
        prisonerName: { firstLast: 'John Smith' },
      },
      redirect: jest.fn(),
      render: jest.fn(),
    } as unknown as Response
    next = jest.fn() as NextFunction
  })
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should defer to next request handler by default', () => {
    controller.requestHandler(req, res, next)

    expect(next).toHaveBeenCalledWith()
    expect(res.render).not.toHaveBeenCalled()
  })

  describe('when enabled', () => {
    beforeEach(() => {
      config.featureToggles.highProfilePrisonersEnabled = true
    })

    it('should require res.locals.isHighProfilePrisoner to be set', () => {
      delete res.locals.isHighProfilePrisoner

      expect(() => controller.requestHandler(req, res, next)).toThrow('Usage error')

      expect(next).not.toHaveBeenCalled()
      expect(res.redirect).not.toHaveBeenCalled()
      expect(res.render).not.toHaveBeenCalled()
    })

    describe.each(['GET', 'POST'] as const)('and method is %s', method => {
      beforeEach(() => {
        req.method = method
        if (method === 'POST') {
          req.body = { formFieldFromUnrelatedPage: '25/11/2026' }
        }
      })

      it('should defer to next request handler when accessing prisoner who is not high profile', () => {
        res.locals.isHighProfilePrisoner = false

        controller.requestHandler(req, res, next)

        expect(next).toHaveBeenCalledWith()
        expect(res.redirect).not.toHaveBeenCalled()
        expect(res.render).not.toHaveBeenCalled()
      })

      it('should defer to next request handler when accessing high profile prisoner and had already justified it', () => {
        res.locals.isHighProfilePrisoner = true
        req.session.justifiedHighProfilePrisonerAccess = { [prisonerNumber]: 'checking non-associations for work' }

        controller.requestHandler(req, res, next)

        expect(next).toHaveBeenCalledWith()
        expect(res.redirect).not.toHaveBeenCalled()
        expect(res.render).not.toHaveBeenCalled()
      })
    })

    describe('and accessing high profile prisoner', () => {
      beforeEach(() => {
        res.locals.isHighProfilePrisoner = true
      })

      it('should render justification form', () => {
        controller.requestHandler(req, res, next)

        expect(next).not.toHaveBeenCalled()
        expect(res.redirect).not.toHaveBeenCalled()
        expect(res.render).toHaveBeenCalledWith('pages/justifyAccess', {
          characterLimit: 250,
          formValues: { justification: '' },
          errors: [],
          backUrl: '/',
        })
      })

      it.each([
        {
          scenario: 'confirmation box not ticked',
          formValues: { justification: 'checking non-associations for work' },
          errors: [
            {
              text: 'Confirm that you have a legitimate business or operational reason to access this profile',
              href: '#confirmation',
            },
          ],
        },
        {
          scenario: 'justification not entered',
          formValues: { confirmation: 'yes', justification: '' },
          errors: [
            {
              text: 'Enter why you need to access this prisoner’s profile',
              href: '#justification',
            },
          ],
        },
        {
          scenario: 'justification is too long',
          formValues: { confirmation: 'yes', justification: 'ab'.repeat(126) },
          errors: [
            {
              text: 'Your explanation must be 250 characters or fewer',
              href: '#justification',
            },
          ],
        },
        {
          scenario: 'there are multiple errors',
          formValues: { justification: '' },
          errors: [
            {
              text: 'Confirm that you have a legitimate business or operational reason to access this profile',
              href: '#confirmation',
            },
            {
              text: 'Enter why you need to access this prisoner’s profile',
              href: '#justification',
            },
          ],
        },
      ])('should preserve user input when re-rendering form with errors if $scenario', ({ formValues, errors }) => {
        flash.mockImplementation(
          // @ts-expect-error this is an overloaded function but only 1 version matters
          type => {
            if (type === 'formValues') {
              return [formValues]
            }
            if (type === 'errors') {
              return errors
            }
            return []
          },
        )

        controller.requestHandler(req, res, next)

        expect(next).not.toHaveBeenCalled()
        expect(res.redirect).not.toHaveBeenCalled()
        expect(res.render).toHaveBeenCalledWith('pages/justifyAccess', {
          characterLimit: 250,
          formValues,
          errors,
          backUrl: '/',
        })
      })
    })

    describe('and submitting form to access high profile prisoner', () => {
      beforeEach(() => {
        req.method = 'POST'
        res.locals.isHighProfilePrisoner = true
      })

      it('should defer to next request handler when there are no errors and save session', () => {
        req.body = { confirmation: 'yes', justification: 'checking non-associations for work' }

        controller.requestHandler(req, res, next)

        expect(flash).not.toHaveBeenCalled()

        expect(next).not.toHaveBeenCalled()
        expect(res.redirect).toHaveBeenCalledWith(originalUrl)
        expect(res.render).not.toHaveBeenCalled()
      })

      it.each([
        {
          scenario: 'confirmation box not ticked',
          submittedFormValues: { justification: 'checking non-associations for work' },
          expectedFormValues: { justification: 'checking non-associations for work' },
          expectedErrors: [
            {
              text: 'Confirm that you have a legitimate business or operational reason to access this profile',
              href: '#confirmation',
            },
          ],
        },
        {
          scenario: 'justification not entered',
          submittedFormValues: { confirmation: 'yes', justification: ' \r\n' },
          expectedFormValues: { confirmation: 'yes', justification: '' },
          expectedErrors: [
            {
              text: 'Enter why you need to access this prisoner’s profile',
              href: '#justification',
            },
          ],
        },
        {
          scenario: 'justification is too long',
          submittedFormValues: { confirmation: 'yes', justification: 'ab'.repeat(126) },
          expectedFormValues: { confirmation: 'yes', justification: 'ab'.repeat(126) },
          expectedErrors: [
            {
              text: 'Your explanation must be 250 characters or fewer',
              href: '#justification',
            },
          ],
        },
        {
          scenario: 'there are multiple errors',
          submittedFormValues: { confirmation: 'no' },
          expectedFormValues: { justification: '' },
          expectedErrors: [
            {
              text: 'Confirm that you have a legitimate business or operational reason to access this profile',
              href: '#confirmation',
            },
            {
              text: 'Enter why you need to access this prisoner’s profile',
              href: '#justification',
            },
          ],
        },
      ])(
        'should re-render form with errors when $scenario',
        ({ submittedFormValues, expectedFormValues, expectedErrors }) => {
          req.body = submittedFormValues

          controller.requestHandler(req, res, next)

          expect(flash).toHaveBeenCalledWith('formValues', expectedFormValues)
          expect(flash).toHaveBeenCalledWith('errors', expectedErrors)

          expect(next).not.toHaveBeenCalled()
          expect(res.redirect).toHaveBeenCalledWith(originalUrl)
          expect(res.render).not.toHaveBeenCalled()
        },
      )
    })
  })
})
