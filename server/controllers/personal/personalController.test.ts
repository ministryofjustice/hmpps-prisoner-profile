import { NextFunction, Request, RequestHandler, Response } from 'express'
import { auditServiceMock } from '../../../tests/mocks/auditServiceMock'
import { careNeedsServiceMock } from '../../../tests/mocks/careNeedsServiceMock'
import { personalPageServiceMock } from '../../../tests/mocks/personalPageServiceMock'
import { FlashMessageType } from '../../data/enums/flashMessageType'
import { AuditService, Page, PostAction } from '../../services/auditService'
import CareNeedsService from '../../services/careNeedsService'
import PersonalPageService from '../../services/personalPageService'
import PersonalController from './personalController'
import { domesticStatusFieldData, numberOfChildrenFieldData, sexualOrientationFieldData } from './fieldData'
import { prisonUserMock } from '../../data/localMockData/user'
import InmateDetail from '../../data/interfaces/prisonApi/InmateDetail'
import { ProfileInformationType } from '../../data/interfaces/prisonApi/ProfileInformation'
import { healthAndMedicationMock } from '../../data/localMockData/healthAndMedicationApi/healthAndMedicationMock'
import { corePersonPhysicalAttributesMock } from '../../data/localMockData/physicalAttributesMock'
import {
  PersonalRelationshipsDomesticStatusMock,
  PersonalRelationshipsNumberOfChildrenMock,
} from '../../data/localMockData/personalRelationshipsApiMock'
import { ReferenceDataCodeDto } from '../../data/interfaces/referenceData'
import { globalPhonesAndEmailsMock } from '../../data/localMockData/globalPhonesAndEmails'

describe('PersonalController', () => {
  let personalPageService: PersonalPageService
  let auditService: AuditService
  let careNeedsService: CareNeedsService
  let controller: PersonalController
  let res: Response
  const next: NextFunction = jest.fn()

  const prisonerNumber = 'A1234BC'

  const defaultMiddleware = {
    clientToken: 'token',
    prisonerData: {
      firstName: 'First',
      lastName: 'Last',
      cellLocation: '2-3-001',
      prisonerNumber,
      prisonId: 999,
    },
    inmateDetail: {
      firstName: 'First',
      lastName: 'Last',
      birthPlace: 'SHEFFIELD',
      profileInformation: [
        { question: 'Smoker or Vaper', resultValue: 'Yes', type: ProfileInformationType.SmokerOrVaper },
        { question: 'Nationality', resultValue: 'BRIT', type: ProfileInformationType.Nationality },
        {
          question: 'Other Nationality',
          resultValue: 'Some other nationality',
          type: ProfileInformationType.OtherNationalities,
        },
        { question: 'Religion', resultValue: 'Buddhist', type: ProfileInformationType.Religion },
        {
          question: 'Sexual orientation',
          resultValue: 'Heterosexual / Straight',
          type: ProfileInformationType.SexualOrientation,
        },
      ],
    } as InmateDetail,
  }

  const defaultLocals = {
    user: prisonUserMock,
    prisonerNumber,
    prisonerName: {
      firstLast: 'First Last',
      lastCommaFirst: 'Last, First',
      full: 'First Last',
    },
    prisonId: 999,
  }

  beforeEach(() => {
    personalPageService = personalPageServiceMock() as PersonalPageService
    personalPageService.getHealthAndMedication = jest.fn(async () => ({ ...healthAndMedicationMock }))
    personalPageService.getPhysicalAttributes = jest.fn(async () => corePersonPhysicalAttributesMock)
    auditService = auditServiceMock()
    careNeedsService = careNeedsServiceMock() as CareNeedsService
    personalPageService.getNumberOfChildren = jest.fn(async () => PersonalRelationshipsNumberOfChildrenMock)
    personalPageService.getDomesticStatus = jest.fn(async () => PersonalRelationshipsDomesticStatusMock)

    controller = new PersonalController(personalPageService, careNeedsService, auditService)
    res = { locals: defaultLocals, render: jest.fn(), redirect: jest.fn() } as unknown as Response
  })

  describe('displayPersonalPage', () => {
    // Skipped to focus on the edit routes for now
    it.skip('Renders the page with information from the service', () => {})
  })

  describe('Sexual orientation', () => {
    describe('Edit', () => {
      const action: RequestHandler = async (req, response) => controller.sexualOrientation().edit(req, response, next)
      const expectedOptions = [
        { text: 'Heterosexual or straight', value: 'HET', checked: true },
        { text: 'Gay or lesbian', value: 'HOM' },
        { text: 'Bisexual', value: 'BIS' },
        { text: 'Other', value: 'OTH' },
        { divider: 'Or' },
        { text: 'They prefer not to say', value: 'ND' },
      ]

      it('Renders the default edit page with the correct data from the prison person API', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware: defaultMiddleware,
        } as unknown as Request
        await action(req, res, next)

        expect(res.render).toHaveBeenCalledWith('pages/edit/radioField', {
          pageTitle: 'Sexual orientation - Prisoner personal details',
          formTitle: `Which of the following best describes First Last’s sexual orientation?`,
          hintText: undefined,
          errors: [],
          options: expectedOptions,
          redirectAnchor: 'sexual-orientation',
          miniBannerData: {
            cellLocation: '2-3-001',
            prisonerName: 'Last, First',
            prisonerNumber,
            prisonerThumbnailImageUrl: `/api/prisoner/${prisonerNumber}/image?imageId=undefined&fullSizeImage=false`,
          },
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (key: string) => {
            if (key === 'errors') return ['error']
            return []
          },
          middleware: defaultMiddleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
      })

      it('Populates the field value from the flash', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (key: string) => {
            return key === 'requestBody' ? [JSON.stringify({ radioField: 'HOM' })] : []
          },
          middleware: defaultMiddleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expect.arrayContaining([expect.objectContaining({ value: 'HOM', checked: true })]),
          }),
        )
      })

      it('Sends a page view audit event', async () => {
        const req = {
          id: 1,
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware: defaultMiddleware,
        } as unknown as Request
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber,
          prisonId: 999,
          correlationId: req.id,
          page: Page.EditSexualOrientation,
        }

        await action(req, res, next)

        expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })

    describe('submit', () => {
      let validRequest: Request
      const action: RequestHandler = async (req, response) => controller.sexualOrientation().submit(req, response, next)

      beforeEach(() => {
        validRequest = {
          id: '1',
          middleware: defaultMiddleware,
          params: { prisonerNumber },
          body: { radioField: 'HET' },
          flash: jest.fn(),
        } as unknown as Request
      })

      it('Updates the sexual orientation', async () => {
        await action(validRequest, res, next)
        expect(personalPageService.updateSexualOrientation).toHaveBeenCalledWith(
          'token',
          prisonUserMock,
          prisonerNumber,
          'HET',
        )
      })

      it('Redirects to the personal page #sexual-orientation on success', async () => {
        await action(validRequest, res, next)
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#sexual-orientation`)
      })

      it('Adds the success message to the flash', async () => {
        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Sexual orientation updated',
          type: FlashMessageType.success,
          fieldName: 'sexualOrientation',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updateSexualOrientation = async () => {
          throw new Error()
        }

        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/sexual-orientation`)
      })

      it('Sends a post success audit event', async () => {
        const request = { ...validRequest, id: 1, body: { radioField: 'HOM' } } as unknown as Request
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber,
          correlationId: request.id,
          action: PostAction.EditSexualOrientation,
          details: { fieldName: sexualOrientationFieldData.fieldName, previous: 'HET', updated: 'HOM' },
        }

        await action(request, res, next)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })
  })

  describe('Number of children', () => {
    describe('Edit', () => {
      const action: RequestHandler = async (req, response) => controller.numberOfChildren().edit(req, response, next)

      it('Renders the default edit page with the correct data from the prison person API', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware: defaultMiddleware,
        } as unknown as Request
        await action(req, res, next)

        expect(res.render).toHaveBeenCalledWith('pages/edit/children', {
          pageTitle: 'Children - Prisoner personal details',
          formTitle: `Does First Last have any children?`,
          errors: [],
          redirectAnchor: 'number-of-children',
          miniBannerData: {
            cellLocation: '2-3-001',
            prisonerName: 'Last, First',
            prisonerNumber,
            prisonerThumbnailImageUrl: `/api/prisoner/${prisonerNumber}/image?imageId=undefined&fullSizeImage=false`,
          },
          radioFieldValue: 'YES',
          currentNumberOfChildren: '2',
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (key: string) => {
            if (key === 'errors') return ['error']
            return []
          },
          middleware: defaultMiddleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
      })

      it('Populates the field values from the flash', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (key: string) => {
            return key === 'requestBody' ? [JSON.stringify({ hasChildren: 'YES', numberOfChildren: '4' })] : []
          },
          middleware: defaultMiddleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            radioFieldValue: 'YES',
            currentNumberOfChildren: '4',
          }),
        )
      })

      it('Sends a page view audit event', async () => {
        const req = {
          id: 1,
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware: defaultMiddleware,
        } as unknown as Request
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber,
          prisonId: 999,
          correlationId: req.id,
          page: Page.EditNumberOfChildren,
        }

        await action(req, res, next)

        expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })

    describe('submit', () => {
      let validRequest: Request
      const action: RequestHandler = async (req, response) => controller.numberOfChildren().submit(req, response, next)

      beforeEach(() => {
        validRequest = {
          id: '1',
          middleware: defaultMiddleware,
          params: { prisonerNumber },
          body: { hasChildren: 'YES', numberOfChildren: '5' },
          flash: jest.fn(),
        } as unknown as Request

        personalPageService.updateNumberOfChildren = jest.fn()
      })

      it('Updates the number of children', async () => {
        await action(validRequest, res, next)
        expect(personalPageService.updateNumberOfChildren).toHaveBeenCalledWith(
          'token',
          prisonUserMock,
          prisonerNumber,
          5,
        )
      })

      it(`Updates the number of children to 0 if 'NO' selected as answer`, async () => {
        await action(
          {
            ...validRequest,
            body: { hasChildren: 'NO' },
          } as Request,
          res,
          next,
        )
        expect(personalPageService.updateNumberOfChildren).toHaveBeenCalledWith(
          'token',
          prisonUserMock,
          prisonerNumber,
          0,
        )
      })

      it('Redirects to the personal page #number-of-children on success', async () => {
        await action(validRequest, res, next)
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#number-of-children`)
      })

      it('Adds the success message to the flash', async () => {
        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Number of children updated',
          type: FlashMessageType.success,
          fieldName: 'numberOfChildren',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updateNumberOfChildren = async () => {
          throw new Error()
        }

        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/children`)
      })

      it('Sends a post success audit event', async () => {
        const request = {
          ...validRequest,
          id: 1,
          body: { hasChildren: 'YES', numberOfChildren: '5' },
        } as unknown as Request
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber,
          correlationId: request.id,
          action: PostAction.EditNumberOfChildren,
          details: { fieldName: numberOfChildrenFieldData.fieldName, previous: '2', updated: '5' },
        }

        await action(request, res, next)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })
  })

  describe('Domestic status', () => {
    describe('Edit', () => {
      const action: RequestHandler = async (req, response) => controller.domesticStatus().edit(req, response, next)
      const referenceData: ReferenceDataCodeDto[] = [
        {
          id: '1',
          code: 'S',
          description: 'Single',
          listSequence: 99,
          isActive: true,
        },
        {
          id: '2',
          code: 'M',
          description: 'Married',
          listSequence: 99,
          isActive: true,
        },
        {
          id: '3',
          code: 'N',
          description: 'The prefer not to say',
          listSequence: 99,
          isActive: true,
        },
      ]

      beforeEach(() => {
        personalPageService.getDomesticStatusReferenceData = jest.fn(async () => referenceData)
      })

      it('Renders the default edit page with the correct data', async () => {
        const expectedOptions = [
          { text: 'Single', value: 'S', checked: true },
          { text: 'Married', value: 'M' },
          { divider: 'Or' },
          { text: 'They prefer not to say', value: 'N' },
        ]

        const req = {
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware: defaultMiddleware,
        } as unknown as Request
        await action(req, res, next)

        expect(res.render).toHaveBeenCalledWith('pages/edit/radioField', {
          pageTitle: 'Marital or civil partnership status - Prisoner personal details',
          formTitle: `What is First Last’s marital or civil partnership status?`,
          hintText: undefined,
          errors: [],
          options: expectedOptions,
          redirectAnchor: 'marriage-or-civil-partnership-status',
          miniBannerData: {
            cellLocation: '2-3-001',
            prisonerName: 'Last, First',
            prisonerNumber,
            prisonerThumbnailImageUrl: `/api/prisoner/${prisonerNumber}/image?imageId=undefined&fullSizeImage=false`,
          },
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (key: string) => {
            if (key === 'errors') return ['error']
            return []
          },
          middleware: defaultMiddleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
      })

      it('Populates the field value from the flash', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (key: string) => {
            return key === 'requestBody' ? [JSON.stringify({ radioField: 'M' })] : []
          },
          middleware: defaultMiddleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expect.arrayContaining([expect.objectContaining({ value: 'M', checked: true })]),
          }),
        )
      })

      it('Sends a page view audit event', async () => {
        const req = {
          id: 1,
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware: defaultMiddleware,
        } as unknown as Request
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber,
          prisonId: 999,
          correlationId: req.id,
          page: Page.EditDomesticStatus,
        }

        await action(req, res, next)

        expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })

    describe('submit', () => {
      let validRequest: Request
      const action: RequestHandler = async (req, response) => controller.domesticStatus().submit(req, response, next)

      beforeEach(() => {
        validRequest = {
          id: '1',
          middleware: defaultMiddleware,
          params: { prisonerNumber },
          body: { radioField: 'M' },
          flash: jest.fn(),
        } as unknown as Request
      })

      it('Updates the domestic status', async () => {
        await action(validRequest, res, next)
        expect(personalPageService.updateDomesticStatus).toHaveBeenCalledWith(
          'token',
          prisonUserMock,
          prisonerNumber,
          'M',
        )
      })

      it('Redirects to the personal page #marriage-or-civil-partnership-status on success', async () => {
        await action(validRequest, res, next)
        expect(res.redirect).toHaveBeenCalledWith(
          `/prisoner/${prisonerNumber}/personal#marriage-or-civil-partnership-status`,
        )
      })

      it('Adds the success message to the flash', async () => {
        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Marital or civil partnership status updated',
          type: FlashMessageType.success,
          fieldName: 'domesticStatus',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updateDomesticStatus = async () => {
          throw new Error()
        }

        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/marital-status`)
      })

      it('Sends a post success audit event', async () => {
        const request = { ...validRequest, id: 1, body: { radioField: 'M' } } as unknown as Request
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber,
          correlationId: request.id,
          action: PostAction.EditDomesticStatus,
          details: { fieldName: domesticStatusFieldData.fieldName, previous: 'S', updated: 'M' },
        }

        await action(request, res, next)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })
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
            middleware: defaultMiddleware,
          } as unknown as Request
          await action(req, res, next)

          expect(res.render).toHaveBeenCalledWith('pages/edit/textFields/addEmail', {
            pageTitle: 'Add this person’s email address - Prisoner personal details',
            formTitle: `Add First Last’s email address`,
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
              cellLocation: '2-3-001',
              prisonerName: 'Last, First',
              prisonerNumber,
              prisonerThumbnailImageUrl: `/api/prisoner/${prisonerNumber}/image?imageId=undefined&fullSizeImage=false`,
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
            middleware: defaultMiddleware,
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
            middleware: defaultMiddleware,
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
            middleware: defaultMiddleware,
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
            middleware: defaultMiddleware,
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
            middleware: defaultMiddleware,
          } as unknown as Request
          await action(req, res, next)

          expect(res.render).toHaveBeenCalledWith('pages/edit/textField', {
            pageTitle: 'Change this person’s email address - Prisoner personal details',
            formTitle: `Change First Last’s email address`,
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
              cellLocation: '2-3-001',
              prisonerName: 'Last, First',
              prisonerNumber,
              prisonerThumbnailImageUrl: `/api/prisoner/${prisonerNumber}/image?imageId=undefined&fullSizeImage=false`,
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
            middleware: defaultMiddleware,
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
            middleware: defaultMiddleware,
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
            middleware: defaultMiddleware,
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
            middleware: defaultMiddleware,
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

  describe('Phone numbers', () => {
    describe('Add a phone number', () => {
      describe('edit', () => {
        const action: RequestHandler = async (req, response) => controller.globalNumbers().add.edit(req, response, next)
        const defaultReq = {
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware: defaultMiddleware,
        } as unknown as Request

        it('Renders the default edit page with the correct data', async () => {
          await action(defaultReq, res, next)

          expect(res.render).toHaveBeenCalledWith('pages/edit/phone', {
            pageTitle: 'Add this person’s phone number - Prisoner personal details',
            formTitle: `Add First Last’s phone number`,
            phoneTypeOptions: expect.not.arrayContaining([expect.objectContaining({ checked: true })]),
            phoneExtension: undefined,
            phoneNumber: undefined,
            addAnotherEnabled: true,
            errors: [],
            miniBannerData: {
              cellLocation: '2-3-001',
              prisonerName: 'Last, First',
              prisonerNumber,
              prisonerThumbnailImageUrl: `/api/prisoner/${prisonerNumber}/image?imageId=undefined&fullSizeImage=false`,
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
            middleware: defaultMiddleware,
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
          middleware: defaultMiddleware,
        } as unknown as Request

        beforeEach(() => {
          personalPageService.getGlobalPhonesAndEmails = jest.fn(async () => globalPhonesAndEmailsMock)
        })

        it('Renders the default edit page with the correct data', async () => {
          await action(defaultReq, res, next)

          expect(res.render).toHaveBeenCalledWith('pages/edit/phone', {
            pageTitle: 'Change this person’s phone number - Prisoner personal details',
            formTitle: `Change First Last’s phone number`,
            phoneTypeOptions: expect.arrayContaining([{ checked: true, text: 'Business', value: 'BUS' }]),
            phoneNumber: '12345 678 901',
            phoneExtension: '123',
            errors: [],
            miniBannerData: {
              cellLocation: '2-3-001',
              prisonerName: 'Last, First',
              prisonerNumber,
              prisonerThumbnailImageUrl: `/api/prisoner/${prisonerNumber}/image?imageId=undefined&fullSizeImage=false`,
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
            middleware: defaultMiddleware,
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
