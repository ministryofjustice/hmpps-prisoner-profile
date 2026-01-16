import { NextFunction, Request, RequestHandler, Response } from 'express'
import { prisonUserMock } from '../../../../data/localMockData/user'
import { AuditService, Page, PostAction } from '../../../../services/auditService'
import { FlashMessageType } from '../../../../data/enums/flashMessageType'
import { corePersonPhysicalAttributesMock } from '../../../../data/localMockData/physicalAttributesMock'
import PersonalPageService from '../../../../services/personalPageService'
import { personalPageServiceMock } from '../../../../../tests/mocks/personalPageServiceMock'
import { auditServiceMock } from '../../../../../tests/mocks/auditServiceMock'
import EyeColourController from './eyeColourController'
import { inmateDetailMock } from '../../../../data/localMockData/inmateDetailMock'
import { PrisonerMockDataA } from '../../../../data/localMockData/prisoner'
import { CorePersonRecordReferenceDataDomain } from '../../../../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { eyeColourCodesMock } from '../../../../data/localMockData/personIntegrationApi/referenceDataMocks'
import { objectToRadioOptions } from '../../../../utils/utils'

describe('EyeColourController', () => {
  let personalPageService: PersonalPageService
  let auditService: AuditService
  let controller: EyeColourController
  let res: Response
  const next: NextFunction = jest.fn()

  const { prisonerNumber } = PrisonerMockDataA

  const middleware = {
    clientToken: 'token',
    prisonerData: PrisonerMockDataA,
    inmateDetail: inmateDetailMock,
  }

  beforeEach(() => {
    personalPageService = personalPageServiceMock() as PersonalPageService
    personalPageService.getPhysicalAttributes = jest.fn(async () => corePersonPhysicalAttributesMock)
    auditService = auditServiceMock()

    controller = new EyeColourController(personalPageService, auditService)
    res = {
      locals: {
        user: prisonUserMock,
        prisonerNumber,
        prisonId: 999,
      },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  /**
   * Tests for the eye colour edit page - where both eyes are the same colour
   */
  describe('eyeColour', () => {
    describe('edit', () => {
      const action: RequestHandler = async (req, response) => controller.eyeColour().edit(req, response, next)

      it('Renders the eye colour edit page', async () => {
        const req = {
          id: '1',
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware,
        } as unknown as Request

        await action(req, res, next)

        expect(personalPageService.getReferenceDataCodes).toHaveBeenCalledWith(
          'token',
          CorePersonRecordReferenceDataDomain.leftEyeColour,
        )
        expect(personalPageService.getPhysicalAttributes).toHaveBeenCalledWith('token', prisonerNumber)
        expect(res.render).toHaveBeenCalledWith('pages/edit/eyeColour', {
          pageTitle: 'Eye colour - Prisoner personal details',
          formTitle: 'Eye colour',
          errors: [],
          options: objectToRadioOptions(
            eyeColourCodesMock,
            'code',
            'description',
            corePersonPhysicalAttributesMock.leftEyeColourCode,
          ),
          miniBannerData: {
            prisonerName: 'Saunders, John',
            prisonerNumber,
            cellLocation: '1-1-035',
            prisonerThumbnailImageUrl: `/api/prisoner/${prisonerNumber}/image?imageId=1413311&fullSizeImage=false`,
          },
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          id: '1',
          params: { prisonerNumber },
          flash: (key: string) => {
            if (key === 'errors') return ['error']
            return []
          },
          middleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
      })

      it('Selects the correct radio using field value from the flash', async () => {
        const req = {
          id: '1',
          params: { prisonerNumber },
          flash: (key: string) => {
            if (key === 'requestBody') return [JSON.stringify({ eyeColour: 'GREEN' })]
            return []
          },
          middleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expect.arrayContaining([{ checked: true, text: 'Green', value: 'GREEN' }]),
          }),
        )
      })

      it('Sends a page view audit event', async () => {
        const req = {
          id: 1,
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware,
        } as unknown as Request
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber,
          prisonId: 999,
          correlationId: req.id,
          page: Page.EditEyeColour,
        }

        await action(req, res, next)

        expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })

    describe('submit', () => {
      let validRequest: Request
      const action: RequestHandler = async (req, response) => controller.eyeColour().submit(req, response, next)

      beforeEach(() => {
        validRequest = {
          id: '1',
          middleware,
          params: { prisonerNumber },
          body: { eyeColour: 'GREEN' },
          flash: jest.fn(),
        } as unknown as Request
      })

      it('Updates the physical characteristic', async () => {
        await action(validRequest, res, next)
        expect(personalPageService.updatePhysicalAttributes).toHaveBeenCalledWith(
          'token',
          prisonUserMock,
          prisonerNumber,
          {
            leftEyeColourCode: 'GREEN',
            rightEyeColourCode: 'GREEN',
          },
        )
      })

      it('Redirects to the personal page #eye-colour on success', async () => {
        await action(validRequest, res, next)
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#eye-colour`)
      })

      it('Adds the success message to the flash', async () => {
        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Eye colour updated',
          type: FlashMessageType.success,
          fieldName: 'eyeColour',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updatePhysicalAttributes = async () => {
          throw new Error()
        }

        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/eye-colour`)
      })

      it('Sends a post success audit event', async () => {
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber,
          correlationId: validRequest.id,
          action: PostAction.EditEyeColour,
          details: {
            fieldName: 'eyeColour',
            previous: { leftEyeColourCode: 'BLUE', rightEyeColourCode: 'BLUE' },
            updated: { leftEyeColourCode: 'GREEN', rightEyeColourCode: 'GREEN' },
          },
        }

        await action(validRequest, res, next)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })
  })

  /**
   * Tests for the eye colour edit page - where left and right eyes are different colours
   */
  describe('eyeColourIndividual', () => {
    describe('edit', () => {
      const action: RequestHandler = async (req, response) => controller.eyeColourIndividual().edit(req, response, next)

      it('Renders the eye colour edit page', async () => {
        const req = {
          id: '1',
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware,
        } as unknown as Request

        await action(req, res, next)

        expect(personalPageService.getReferenceDataCodes).toHaveBeenCalledWith(
          'token',
          CorePersonRecordReferenceDataDomain.leftEyeColour,
        )
        expect(personalPageService.getReferenceDataCodes).toHaveBeenCalledWith(
          'token',
          CorePersonRecordReferenceDataDomain.rightEyeColour,
        )
        expect(personalPageService.getPhysicalAttributes).toHaveBeenCalledWith('token', prisonerNumber)
        expect(res.render).toHaveBeenCalledWith('pages/edit/eyeColourIndividual', {
          pageTitle: 'Left and right eye colours - Prisoner personal details',
          formTitle: 'Left and right eye colours',
          errors: [],
          leftOptions: objectToRadioOptions(
            eyeColourCodesMock,
            'code',
            'description',
            corePersonPhysicalAttributesMock.leftEyeColourCode,
          ),
          rightOptions: objectToRadioOptions(
            eyeColourCodesMock,
            'code',
            'description',
            corePersonPhysicalAttributesMock.rightEyeColourCode,
          ),
          miniBannerData: {
            prisonerName: 'Saunders, John',
            prisonerNumber,
            cellLocation: '1-1-035',
            prisonerThumbnailImageUrl: `/api/prisoner/${prisonerNumber}/image?imageId=1413311&fullSizeImage=false`,
          },
        })
      })

      it('Populates the errors from the flash', async () => {
        const req = {
          id: '1',
          params: { prisonerNumber },
          flash: (key: string) => {
            if (key === 'errors') return ['error']
            return []
          },
          middleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ errors: ['error'] }))
      })

      it('Selects the correct radio using field value from the flash', async () => {
        const req = {
          id: '1',
          params: { prisonerNumber },
          flash: (key: string) => {
            if (key === 'requestBody') return [JSON.stringify({ leftEyeColour: 'BROWN', rightEyeColour: 'GREEN' })]
            return []
          },
          middleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            leftOptions: expect.arrayContaining([{ checked: true, text: 'Brown', value: 'BROWN' }]),
            rightOptions: expect.arrayContaining([{ checked: true, text: 'Green', value: 'GREEN' }]),
          }),
        )
      })

      it('Sends a page view audit event', async () => {
        const req = {
          id: 1,
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware,
        } as unknown as Request
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber,
          prisonId: 999,
          correlationId: req.id,
          page: Page.EditEyeColour,
        }

        await action(req, res, next)

        expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })

    describe('submit', () => {
      let validRequest: Request
      const action: RequestHandler = async (req, response) =>
        controller.eyeColourIndividual().submit(req, response, next)

      beforeEach(() => {
        validRequest = {
          id: '1',
          middleware,
          params: { prisonerNumber },
          body: { leftEyeColour: 'BROWN', rightEyeColour: 'GREEN' },
          flash: jest.fn(),
        } as unknown as Request
      })

      it('Updates the physical characteristic', async () => {
        await action(validRequest, res, next)
        expect(personalPageService.updatePhysicalAttributes).toHaveBeenCalledWith(
          'token',
          prisonUserMock,
          prisonerNumber,
          {
            leftEyeColourCode: 'BROWN',
            rightEyeColourCode: 'GREEN',
          },
        )
      })

      it('Redirects to the personal page #eye-colour on success', async () => {
        await action(validRequest, res, next)
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#eye-colour`)
      })

      it('Adds the success message to the flash', async () => {
        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Left and right eye colours updated',
          type: FlashMessageType.success,
          fieldName: 'eyeColour',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updatePhysicalAttributes = async () => {
          throw new Error()
        }

        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/eye-colour-individual`)
      })

      it('Sends a post success audit event', async () => {
        const request = {
          ...validRequest,
          id: 1,
          body: { leftEyeColour: 'BROWN', rightEyeColour: 'GREEN' },
        } as unknown as Request
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber,
          correlationId: request.id,
          action: PostAction.EditEyeColour,
          details: {
            fieldName: 'eyeColour',
            previous: {
              leftEyeColourCode: corePersonPhysicalAttributesMock.leftEyeColourCode,
              rightEyeColourCode: corePersonPhysicalAttributesMock.rightEyeColourCode,
            },
            updated: { leftEyeColourCode: 'BROWN', rightEyeColourCode: 'GREEN' },
          },
        }

        await action(request, res, next)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })
  })
})
