import { NextFunction, Request, RequestHandler, Response } from 'express'
import { prisonUserMock } from '../../../../data/localMockData/user'
import { AuditService, Page, PostAction } from '../../../../services/auditService'
import { FlashMessageType } from '../../../../data/enums/flashMessageType'
import PersonalPageService from '../../../../services/personalPageService'
import { personalPageServiceMock } from '../../../../../tests/mocks/personalPageServiceMock'
import { auditServiceMock } from '../../../../../tests/mocks/auditServiceMock'
import { inmateDetailMock } from '../../../../data/localMockData/inmateDetailMock'
import { PrisonerMockDataA } from '../../../../data/localMockData/prisoner'
import { ProfileInformationType } from '../../../../data/interfaces/prisonApi/ProfileInformation'
import PhoneNumberController from './phoneNumberController'
import { globalPhonesAndEmailsMock } from '../../../../data/localMockData/globalPhonesAndEmails'

describe('PhoneNumbersController', () => {
  let personalPageService: PersonalPageService
  let auditService: AuditService
  let controller: PhoneNumberController
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

    controller = new PhoneNumberController(personalPageService, auditService)
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

  describe('Phone numbers', () => {
    describe('Add a phone number', () => {
      describe('edit', () => {
        const action: RequestHandler = async (req, response) => controller.globalNumbers().add.edit(req, response, next)
        const defaultReq = {
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware,
        } as unknown as Request

        it('Renders the default edit page with the correct data', async () => {
          await action(defaultReq, res, next)

          expect(res.render).toHaveBeenCalledWith('pages/edit/phone', {
            pageTitle: 'Add this person’s phone number - Prisoner personal details',
            formTitle: `Add John Saunders’ phone number`,
            phoneTypeOptions: expect.not.arrayContaining([expect.objectContaining({ checked: true })]),
            phoneExtension: undefined,
            phoneNumber: undefined,
            addAnotherEnabled: true,
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
            ...defaultReq,
            flash: (key: string) => {
              if (key === 'errors') return ['error']
              return []
            },
          } as unknown as Request
          await action(req, res, next)
          expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
        })

        it('Populates the field value from the flash', async () => {
          const req = {
            ...defaultReq,
            flash: (key: string) => {
              return key === 'requestBody'
                ? [JSON.stringify({ phoneNumberType: 'MOB', phoneNumber: '12345', phoneExtension: '123' })]
                : []
            },
          } as unknown as Request
          await action(req, res, next)
          expect(res.render).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
              phoneTypeOptions: expect.arrayContaining([{ checked: true, text: 'Mobile', value: 'MOB' }]),
              phoneNumber: '12345',
              phoneExtension: '123',
            }),
          )
        })

        it('Sends a page view audit event', async () => {
          const req = {
            ...defaultReq,
            id: 1,
          } as unknown as Request
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber,
            prisonId: 999,
            correlationId: req.id,
            page: Page.AddPhoneNumber,
          }

          await action(req, res, next)

          expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })

      describe('submit', () => {
        let validRequest: Request
        const action: RequestHandler = async (req, response) =>
          controller.globalNumbers().add.submit(req, response, next)

        beforeEach(() => {
          validRequest = {
            id: '1',
            middleware,
            params: { prisonerNumber },
            body: { phoneNumberType: 'MOB', phoneNumber: '1234', phoneExtension: '4321' },
            flash: jest.fn(),
          } as unknown as Request

          personalPageService.getGlobalPhonesAndEmails = jest.fn(async () => globalPhonesAndEmailsMock)
        })

        it('Updates the phone number', async () => {
          await action(validRequest, res, next)
          expect(personalPageService.createGlobalPhoneNumber).toHaveBeenCalledWith(
            'token',
            prisonUserMock,
            prisonerNumber,
            {
              phoneNumberType: 'MOB',
              phoneNumber: '1234',
              phoneExtension: '4321',
            },
          )
        })

        it('Redirects to the personal page #phones-and-emais on success', async () => {
          await action(validRequest, res, next)
          expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#phones-and-emails`)
        })

        it('Redirects to the add phone number page on success with add another specified', async () => {
          await action({ ...validRequest, query: { addAnother: 'true' } } as unknown as Request, res, next)
          expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/add-phone-number`)
        })

        it('Adds the success message to the flash', async () => {
          await action(validRequest, res, next)

          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Phone number updated',
            type: FlashMessageType.success,
            fieldName: 'phoneNumber',
          })
        })

        it('Handles duplicate phone numbers with extensions', async () => {
          personalPageService.getGlobalPhonesAndEmails = jest.fn().mockResolvedValue({
            phones: [
              {
                number: '(12)34',
                type: 'MOB',
                extension: '4321',
              },
            ],
            emails: [],
          })

          validRequest.body = { phoneNumberType: 'FAX', phoneNumber: '1(23)4', phoneExtension: '4321' }

          await action(validRequest, res, next)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [
            {
              href: '#phone-number',
              text: 'This phone number already exists for this person. Add a new number or edit the saved one',
            },
          ])
          expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/add-phone-number`)
        })

        it('Handles duplicate phone numbers without extensions', async () => {
          personalPageService.getGlobalPhonesAndEmails = jest.fn().mockResolvedValue({
            phones: [
              {
                number: '(12)34',
                type: 'MOB',
                extension: null,
              },
            ],
            emails: [],
          })

          validRequest.body = { phoneNumberType: 'FAX', phoneNumber: '1(23)4', phoneExtension: '' }

          await action(validRequest, res, next)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [
            {
              href: '#phone-number',
              text: 'This phone number already exists for this person. Add a new number or edit the saved one',
            },
          ])
          expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/add-phone-number`)
        })

        it('Allows duplicate phone number if the extention differs', async () => {
          personalPageService.getGlobalPhonesAndEmails = jest.fn().mockResolvedValue({
            phones: [
              {
                number: '(12)34',
                type: 'MOB',
                extension: '4321',
              },
            ],
            emails: [],
          })

          validRequest.body = { phoneNumberType: 'FAX', phoneNumber: '1(23)4', phoneExtension: '4322' }

          await action(validRequest, res, next)

          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Phone number updated',
            type: FlashMessageType.success,
            fieldName: 'phoneNumber',
          })
        })

        it('Handles API errors', async () => {
          personalPageService.createGlobalPhoneNumber = async () => {
            throw new Error()
          }

          await action(validRequest, res, next)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
          expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/add-phone-number`)
        })

        it('Sends a post success audit event', async () => {
          const request = {
            ...validRequest,
            id: 1,
            body: { phoneNumberType: 'MOB', phoneNumber: '1234', phoneExtension: '4321' },
          } as unknown as Request

          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber,
            correlationId: request.id,
            action: PostAction.AddPhoneNumber,
            details: {
              fieldName: 'phoneNumber',
              previous: {},
              updated: {
                phoneExtension: '4321',
                phoneNumber: '1234',
                phoneNumberType: 'MOB',
              },
            },
          }

          await action(request, res, next)

          expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })
    })

    describe('Edit a phone number', () => {
      describe('edit', () => {
        const action: RequestHandler = async (req, response) =>
          controller.globalNumbers().edit.edit(req, response, next)
        const defaultReq = {
          params: { prisonerNumber, phoneNumberId: '123' },
          flash: (): string[] => [],
          middleware,
        } as unknown as Request

        beforeEach(() => {
          personalPageService.getGlobalPhonesAndEmails = jest.fn(async () => globalPhonesAndEmailsMock)
        })

        it('Renders the default edit page with the correct data', async () => {
          await action(defaultReq, res, next)

          expect(res.render).toHaveBeenCalledWith('pages/edit/phone', {
            pageTitle: 'Change this person’s phone number - Prisoner personal details',
            formTitle: `Change John Saunders’ phone number`,
            phoneTypeOptions: expect.arrayContaining([{ checked: true, text: 'Business', value: 'BUS' }]),
            phoneNumber: '12345 678 901',
            phoneExtension: '123',
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
            ...defaultReq,
            flash: (key: string) => {
              if (key === 'errors') return ['error']
              return []
            },
          } as unknown as Request
          await action(req, res, next)
          expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
        })

        it('Populates the field value from the flash', async () => {
          const req = {
            ...defaultReq,
            flash: (key: string) => {
              return key === 'requestBody'
                ? [JSON.stringify({ phoneNumberType: 'MOB', phoneNumber: '12345', phoneExtension: '123' })]
                : []
            },
          } as unknown as Request
          await action(req, res, next)
          expect(res.render).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({
              phoneTypeOptions: expect.arrayContaining([{ checked: true, text: 'Mobile', value: 'MOB' }]),
              phoneNumber: '12345',
              phoneExtension: '123',
            }),
          )
        })

        it('Sends a page view audit event', async () => {
          const req = {
            ...defaultReq,
            id: 1,
          } as unknown as Request
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber,
            prisonId: 999,
            correlationId: req.id,
            page: Page.EditPhoneNumber,
          }

          await action(req, res, next)

          expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })

      describe('submit', () => {
        let validRequest: Request
        const action: RequestHandler = async (req, response) =>
          controller.globalNumbers().edit.submit(req, response, next)

        beforeEach(() => {
          validRequest = {
            id: '1',
            middleware,
            params: { prisonerNumber, phoneNumberId: '123' },
            body: { phoneNumberType: 'MOB', phoneNumber: '1234', phoneExtension: '4321' },
            flash: jest.fn(),
          } as unknown as Request

          personalPageService.getGlobalPhonesAndEmails = jest.fn(async () => globalPhonesAndEmailsMock)
        })

        it('Updates the email', async () => {
          await action(validRequest, res, next)
          expect(personalPageService.updateGlobalPhoneNumber).toHaveBeenCalledWith(
            'token',
            prisonUserMock,
            prisonerNumber,
            '123',
            {
              phoneNumberType: 'MOB',
              phoneNumber: '1234',
              phoneExtension: '4321',
            },
          )
        })

        it('Redirects to the personal page #phones-and-emais on success', async () => {
          await action(validRequest, res, next)
          expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#phones-and-emails`)
        })

        it('Adds the success message to the flash', async () => {
          await action(validRequest, res, next)

          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Phone number updated',
            type: FlashMessageType.success,
            fieldName: 'phoneNumber',
          })
        })

        it('Handles duplicate phone numbers', async () => {
          personalPageService.getGlobalPhonesAndEmails = jest.fn().mockResolvedValue({
            phones: [
              {
                id: '123',
                number: '(12)34',
                type: 'MOB',
                extension: '1111',
              },
              {
                id: '1234',
                number: '(12)34',
                type: 'MOB',
                extension: '4321',
              },
            ],
            emails: [],
          })

          validRequest.body = { phoneNumberType: 'FAX', phoneNumber: '1(23)4', phoneExtension: '4321' }

          await action(validRequest, res, next)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [
            {
              href: '#phone-number',
              text: 'This phone number already exists for this person. Add a new number or edit the saved one',
            },
          ])

          expect(validRequest.flash).not.toHaveBeenCalledWith('errors', [
            {
              text: 'There was an error please try again',
            },
          ])
          expect(validRequest.flash).not.toHaveBeenCalledTimes(3)

          expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/change-phone-number/123`)
        })

        it('Allows duplicate phone number if the extention differs', async () => {
          personalPageService.getGlobalPhonesAndEmails = jest.fn().mockResolvedValue({
            phones: [
              {
                id: '123',
                number: '(12)34',
                type: 'MOB',
                extension: '1111',
              },
              {
                id: '1234',
                number: '(12)34',
                type: 'MOB',
                extension: '4321',
              },
            ],
            emails: [],
          })

          validRequest.body = { phoneNumberType: 'FAX', phoneNumber: '1(23)4', phoneExtension: '5555' }

          await action(validRequest, res, next)

          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Phone number updated',
            type: FlashMessageType.success,
            fieldName: 'phoneNumber',
          })
        })

        it('Handles API errors', async () => {
          personalPageService.updateGlobalPhoneNumber = async () => {
            throw new Error()
          }

          await action(validRequest, res, next)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
          expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/change-phone-number/123`)
        })

        it('Sends a post success audit event', async () => {
          const request = {
            ...validRequest,
            id: 1,
            body: { phoneNumberType: 'MOB', phoneNumber: '1234', phoneExtension: '4321' },
          } as unknown as Request

          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber,
            correlationId: request.id,
            action: PostAction.EditPhoneNumber,
            details: {
              fieldName: 'phoneNumber',
              previous: {
                phoneExtension: '123',
                phoneNumber: '12345 678 901',
                phoneNumberType: 'BUS',
              },
              updated: {
                phoneExtension: '4321',
                phoneNumber: '1234',
                phoneNumberType: 'MOB',
              },
            },
          }

          await action(request, res, next)

          expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })
    })
  })
})
