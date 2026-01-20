import { NextFunction, Request, RequestHandler, Response } from 'express'
import { prisonUserMock } from '../../../../data/localMockData/user'
import { AuditService, Page, PostAction } from '../../../../services/auditService'
import PersonalPageService from '../../../../services/personalPageService'
import { personalPageServiceMock } from '../../../../../tests/mocks/personalPageServiceMock'
import { auditServiceMock } from '../../../../../tests/mocks/auditServiceMock'
import { inmateDetailMock } from '../../../../data/localMockData/inmateDetailMock'
import { PrisonerMockDataA } from '../../../../data/localMockData/prisoner'
import { ProfileInformationType } from '../../../../data/interfaces/prisonApi/ProfileInformation'
import EmailAddressController from './emailAddressController'
import { globalPhonesAndEmailsMock } from '../../../../data/localMockData/globalPhonesAndEmails'
import { FlashMessageType } from '../../../../data/enums/flashMessageType'

describe('EmailAddressController', () => {
  let personalPageService: PersonalPageService
  let auditService: AuditService
  let controller: EmailAddressController
  let res: Response
  const next: NextFunction = jest.fn()

  const { prisonerNumber } = PrisonerMockDataA

  const middleware = {
    clientToken: 'token',
    prisonerData: PrisonerMockDataA,
    inmateDetail: {
      ...inmateDetailMock,
      profileInformation: [
        { question: 'Nationality', resultValue: 'BRIT', type: ProfileInformationType.Nationality },
        {
          question: 'Other Nationality',
          resultValue: 'Some other nationality',
          type: ProfileInformationType.OtherNationalities,
        },
      ],
    },
  }

  beforeEach(() => {
    personalPageService = personalPageServiceMock() as PersonalPageService
    auditService = auditServiceMock()

    controller = new EmailAddressController(personalPageService, auditService)
    res = {
      locals: {
        user: prisonUserMock,
        prisonerName: {
          firstLast: 'John Saunders',
          lastCommaFirst: 'Saunders, John',
          full: 'John Saunders',
        },
        prisonerNumber,
        prisonId: 999,
      },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  describe('Emails', () => {
    describe('Creating an email', () => {
      describe('edit', () => {
        const action: RequestHandler = async (req, response) => controller.globalEmails().add.edit(req, response, next)

        beforeEach(() => {
          personalPageService.getGlobalPhonesAndEmails = jest.fn(async () => globalPhonesAndEmailsMock)
        })

        it('Renders the default edit page with the correct data', async () => {
          const req = {
            params: { prisonerNumber, emailAddressId: '234' },
            flash: (): string[] => [],
            middleware,
          } as unknown as Request
          await action(req, res, next)

          expect(res.render).toHaveBeenCalledWith('pages/edit/textFields/addEmail', {
            pageTitle: 'Add this person’s email address - Prisoner personal details',
            formTitle: `Add John Saunders’ email address`,
            hintText: 'For example name@email.co.uk',
            fieldName: 'emailAddress',
            fieldValue: '',
            inputClasses: 'govuk-!-width-one-half',
            submitButtonText: 'Save and return to profile',
            inputType: 'email',
            spellcheck: false,
            redirectAnchor: 'phones-and-emails',
            errors: [],
            miniBannerData: {
              cellLocation: '1-1-035',
              prisonerName: 'Saunders, John',
              prisonerNumber,
              prisonerThumbnailImageUrl: `/api/prisoner/${prisonerNumber}/image?imageId=1413311&fullSizeImage=false`,
            },
          })
        })

        it('Populates the errors from the flash', async () => {
          const req = {
            params: { prisonerNumber, emailAddressId: '234' },
            flash: (key: string) => {
              if (key === 'errors') return ['error']
              return []
            },
            middleware,
          } as unknown as Request
          await action(req, res, next)
          expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
        })

        it('Populates the field value from the flash', async () => {
          const req = {
            params: { prisonerNumber, emailAddressId: '234' },
            flash: (key: string) => {
              return key === 'requestBody' ? [JSON.stringify({ emailAddress: 'foo@bar.com' })] : []
            },
            middleware,
          } as unknown as Request
          await action(req, res, next)
          expect(res.render).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ fieldValue: 'foo@bar.com' }),
          )
        })

        it('Sends a page view audit event', async () => {
          const req = {
            id: 1,
            params: { prisonerNumber, emailAddressId: '234' },
            flash: (): string[] => [],
            middleware,
          } as unknown as Request
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber,
            prisonId: 999,
            correlationId: req.id,
            page: Page.AddEmailAddress,
          }

          await action(req, res, next)

          expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })

      describe('submit', () => {
        let validRequest: Request
        const action: RequestHandler = async (req, response) =>
          controller.globalEmails().add.submit(req, response, next)

        beforeEach(() => {
          validRequest = {
            id: '1',
            middleware,
            params: { prisonerNumber, emailAddressId: '234' },
            body: { emailAddress: 'fOO@exaMple.com' },
            flash: jest.fn(),
          } as unknown as Request

          personalPageService.getGlobalPhonesAndEmails = jest.fn(async () => globalPhonesAndEmailsMock)
        })

        it('Updates the email', async () => {
          await action(validRequest, res, next)
          expect(personalPageService.createGlobalEmail).toHaveBeenCalledWith(
            'token',
            prisonUserMock,
            prisonerNumber,
            'foo@example.com',
          )
        })

        it('Redirects to the personal page #phones-and-emais on success', async () => {
          await action(validRequest, res, next)
          expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#phones-and-emails`)
        })

        it('Redirects back when add another is added as a query param', async () => {
          await action({ ...validRequest, query: { addAnother: 'true' } } as unknown as Request, res, next)
          expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/add-email-address`)
        })

        it('Adds the success message to the flash', async () => {
          await action(validRequest, res, next)

          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Email address updated',
            type: FlashMessageType.success,
            fieldName: 'emailAddress',
          })
        })

        it('Handles duplicate emails', async () => {
          personalPageService.getGlobalPhonesAndEmails = jest.fn().mockResolvedValue({
            emails: [{ email: 'foo@example.com' }],
            phones: [],
          })

          validRequest.body = { emailAddress: ' Foo@ eXAMplE.com' }

          await action(validRequest, res, next)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [
            {
              href: '#email',
              text: 'This email address already exists for this person. Add a new email or edit the saved one',
            },
          ])

          expect(validRequest.flash).not.toHaveBeenCalledWith('errors', [
            {
              text: 'There was an error please try again',
            },
          ])

          expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/add-email-address`)
        })

        it('Handles API errors', async () => {
          personalPageService.createGlobalEmail = async () => {
            throw new Error()
          }

          await action(validRequest, res, next)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
          expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/add-email-address`)
        })

        it('Sends a post success audit event', async () => {
          const request = { ...validRequest, id: 1, body: { emailAddress: 'foo@bar.com' } } as unknown as Request
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber,
            correlationId: request.id,
            action: PostAction.AddEmailAddress,
            details: { fieldName: 'emailAddress', previous: '', updated: 'foo@bar.com' },
          }

          await action(request, res, next)

          expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })
    })
    describe('Edit an email', () => {
      describe('edit', () => {
        const action: RequestHandler = async (req, response) => controller.globalEmails().edit.edit(req, response, next)

        beforeEach(() => {
          personalPageService.getGlobalPhonesAndEmails = jest.fn(async () => globalPhonesAndEmailsMock)
        })

        it('Renders the default edit page with the correct data', async () => {
          const req = {
            params: { prisonerNumber, emailAddressId: '234' },
            flash: (): string[] => [],
            middleware,
          } as unknown as Request
          await action(req, res, next)

          expect(res.render).toHaveBeenCalledWith('pages/edit/textField', {
            pageTitle: 'Change this person’s email address - Prisoner personal details',
            formTitle: `Change John Saunders’ email address`,
            hintText: 'For example name@email.co.uk',
            fieldName: 'emailAddress',
            fieldValue: 'one@example.com',
            inputClasses: 'govuk-!-width-one-half',
            submitButtonText: 'Save and return to profile',
            inputType: 'email',
            spellcheck: false,
            redirectAnchor: 'phones-and-emails',
            errors: [],
            miniBannerData: {
              cellLocation: '1-1-035',
              prisonerName: 'Saunders, John',
              prisonerNumber,
              prisonerThumbnailImageUrl: `/api/prisoner/${prisonerNumber}/image?imageId=1413311&fullSizeImage=false`,
            },
          })
        })

        it('Populates the errors from the flash', async () => {
          const req = {
            params: { prisonerNumber, emailAddressId: '234' },
            flash: (key: string) => {
              if (key === 'errors') return ['error']
              return []
            },
            middleware,
          } as unknown as Request
          await action(req, res, next)
          expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
        })

        it('Populates the field value from the flash', async () => {
          const req = {
            params: { prisonerNumber, emailAddressId: '234' },
            flash: (key: string) => {
              return key === 'requestBody' ? [JSON.stringify({ emailAddress: 'foo@bar.com' })] : []
            },
            middleware,
          } as unknown as Request
          await action(req, res, next)
          expect(res.render).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ fieldValue: 'foo@bar.com' }),
          )
        })

        it('Sends a page view audit event', async () => {
          const req = {
            id: 1,
            params: { prisonerNumber, emailAddressId: '234' },
            flash: (): string[] => [],
            middleware,
          } as unknown as Request
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber,
            prisonId: 999,
            correlationId: req.id,
            page: Page.EditEmailAddress,
          }

          await action(req, res, next)

          expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })
      describe('submit', () => {
        let validRequest: Request
        const action: RequestHandler = async (req, response) =>
          controller.globalEmails().edit.submit(req, response, next)

        beforeEach(() => {
          validRequest = {
            id: '1',
            middleware,
            params: { prisonerNumber, emailAddressId: '234' },
            body: { emailAddress: 'foo@example.com' },
            flash: jest.fn(),
          } as unknown as Request

          personalPageService.getGlobalPhonesAndEmails = jest.fn(async () => globalPhonesAndEmailsMock)
        })

        it('Updates the email', async () => {
          await action(validRequest, res, next)
          expect(personalPageService.updateGlobalEmail).toHaveBeenCalledWith(
            'token',
            prisonUserMock,
            prisonerNumber,
            '234',
            'foo@example.com',
          )
        })

        it('Redirects to the personal page #phones-and-emais on success', async () => {
          await action(validRequest, res, next)
          expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#phones-and-emails`)
        })

        it('Adds the success message to the flash', async () => {
          await action(validRequest, res, next)

          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Email address updated',
            type: FlashMessageType.success,
            fieldName: 'emailAddress',
          })
        })

        it('Handles API errors', async () => {
          personalPageService.updateGlobalEmail = async () => {
            throw new Error()
          }

          await action(validRequest, res, next)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
          expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/change-email-address/234`)
        })

        it('Handles duplicate emails', async () => {
          personalPageService.getGlobalPhonesAndEmails = jest.fn().mockResolvedValue({
            emails: [
              { id: '234', email: 'foo@example.com' },
              { id: '555', email: 'something@example.com' },
            ],
            phones: [],
          })

          validRequest.body = { emailAddress: 'someThinG@exaM ple.com' }

          await action(validRequest, res, next)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [
            {
              href: '#email',
              text: 'This email address already exists for this person. Add a new email or edit the saved one',
            },
          ])

          expect(validRequest.flash).not.toHaveBeenCalledWith('errors', [
            {
              text: 'There was an error please try again',
            },
          ])

          expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/change-email-address/234`)
        })

        it('Sends a post success audit event', async () => {
          const request = { ...validRequest, id: 1, body: { emailAddress: 'foo@bar.com' } } as unknown as Request
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber,
            correlationId: request.id,
            action: PostAction.EditEmailAddress,
            details: { fieldName: 'emailAddress', previous: 'one@example.com', updated: 'foo@bar.com' },
          }

          await action(request, res, next)

          expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })
    })
  })
})
