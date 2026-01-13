import { NextFunction, Request, RequestHandler, Response } from 'express'
import { prisonUserMock } from '../../../../data/localMockData/user'
import { AuditService, Page, PostAction } from '../../../../services/auditService'
import { FlashMessageType } from '../../../../data/enums/flashMessageType'
import { weightFieldData } from '../../fieldData'
import { CorePersonPhysicalAttributes } from '../../../../services/interfaces/corePerson/corePersonPhysicalAttributes'
import { corePersonPhysicalAttributesMock } from '../../../../data/localMockData/physicalAttributesMock'
import PersonalPageService from '../../../../services/personalPageService'
import { personalPageServiceMock } from '../../../../../tests/mocks/personalPageServiceMock'
import { auditServiceMock } from '../../../../../tests/mocks/auditServiceMock'
import WeightController from './weightController'
import { inmateDetailMock } from '../../../../data/localMockData/inmateDetailMock'
import { PrisonerMockDataA } from '../../../../data/localMockData/prisoner'

describe('WeightController', () => {
  let personalPageService: PersonalPageService
  let auditService: AuditService
  let controller: WeightController
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

    controller = new WeightController(personalPageService, auditService)
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

  describe('metric', () => {
    describe('edit', () => {
      const action: RequestHandler = async (req, response) => controller.metric().edit(req, response, next)

      it('Renders the default edit page with the correct data from the prison person API', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware,
        } as unknown as Request
        await action(req, res, next)

        expect(personalPageService.getPhysicalAttributes).toHaveBeenCalledWith('token', prisonerNumber)
        expect(res.render).toHaveBeenCalledWith('pages/edit/weightMetric', {
          pageTitle: expect.anything(),
          errors: [],
          fieldValue: 100,
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

      it('Populates the field value from the flash', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (key: string) => {
            return key === 'requestBody' ? [JSON.stringify({ kilograms: '1234' })] : []
          },
          middleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ fieldValue: '1234' }))
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
          page: Page.EditWeight,
        }

        await action(req, res, next)

        expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })

    describe('submit', () => {
      let validRequest: Request
      const action: RequestHandler = async (req, response) => controller.metric().submit(req, response, next)

      beforeEach(() => {
        validRequest = {
          middleware,
          params: { prisonerNumber },
          body: { kilograms: '80' },
          flash: jest.fn(),
        } as unknown as Request
      })

      it.each([
        { kilograms: '', updateRequest: { weight: null } },
        { kilograms: '50', updateRequest: { weight: 50 } },
        { kilograms: '12', updateRequest: { weight: 12 } },
        { kilograms: '640', updateRequest: { weight: 640 } },
      ])('Valid request: %s', async ({ kilograms, updateRequest }) => {
        const request = { ...validRequest, body: { kilograms } } as Request
        await action(request, res, next)
        expect(personalPageService.updatePhysicalAttributes).toHaveBeenCalledWith(
          expect.anything(),
          prisonUserMock,
          expect.anything(),
          expect.objectContaining(updateRequest),
        )
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#weight`)
        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Weight updated',
          type: FlashMessageType.success,
          fieldName: 'weight',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updatePhysicalAttributes = async () => {
          throw new Error()
        }

        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(validRequest.flash).toHaveBeenCalledWith('requestBody', JSON.stringify(validRequest.body))
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/weight`)
      })

      it('Sends a post success audit event', async () => {
        const request = { ...validRequest, id: 1, body: { kilograms: '96' } } as unknown as Request
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber,
          correlationId: request.id,
          action: PostAction.EditWeight,
          details: { fieldName: weightFieldData.fieldName, previous: 100, updated: 96 },
        }

        await action(request, res, next)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })
  })

  describe('imperial', () => {
    describe('edit', () => {
      const action: RequestHandler = async (req, response) => controller.imperial().edit(req, response, next)

      it('Renders the default edit page with the correct data', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware,
        } as unknown as Request
        await action(req, res, next)

        expect(res.render).toHaveBeenCalledWith('pages/edit/weightImperial', {
          pageTitle: expect.anything(),
          errors: [],
          imperialWeightOption: 'stoneAndPounds',
          stoneValue: 15,
          poundsValue: 10,
          poundsOnlyValue: 220,
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

      it('Populates the field value from the flash', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (key: string) => {
            return key === 'requestBody'
              ? [
                  JSON.stringify({
                    imperialWeightOption: 'poundsOnly',
                    stone: '5',
                    pounds: '10',
                    poundsOnly: '220',
                  }),
                ]
              : []
          },
          middleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            imperialWeightOption: 'poundsOnly',
            stoneValue: '5',
            poundsValue: '10',
            poundsOnlyValue: '220',
          }),
        )
      })

      it('Keeps the inputs empty when no weight exists', async () => {
        personalPageService.getPhysicalAttributes = jest.fn(
          async (): Promise<CorePersonPhysicalAttributes> => ({
            ...corePersonPhysicalAttributesMock,
            height: undefined,
            weight: undefined,
          }),
        )
        const req = {
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ stoneValue: undefined, poundsValue: undefined, poundsOnlyValue: undefined }),
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
          page: Page.EditWeight,
        }

        await action(req, res, next)

        expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })

    describe('submit', () => {
      let validRequest: Request
      const action: RequestHandler = async (req, response) => controller.imperial().submit(req, response, next)

      beforeEach(() => {
        validRequest = {
          middleware,
          params: { prisonerNumber },
          body: { imperialWeightOption: 'stoneAndPounds', stone: '10', pounds: '12' },
          flash: jest.fn(),
        } as unknown as Request
      })

      it.each([
        // Stone and Pounds:
        { imperialWeightOption: 'stoneAndPounds', stone: '', pounds: '', updateRequest: { weight: null } },
        { imperialWeightOption: 'stoneAndPounds', stone: '5', pounds: '2', updateRequest: { weight: 33 } },
        { imperialWeightOption: 'stoneAndPounds', stone: '3', pounds: '', updateRequest: { weight: 19 } },

        // Pounds only:
        { imperialWeightOption: 'poundsOnly', poundsOnly: '', updateRequest: { weight: null } },
        { imperialWeightOption: 'poundsOnly', poundsOnly: '150', updateRequest: { weight: 68 } },
      ])('Valid request: %s', async ({ imperialWeightOption, stone, pounds, poundsOnly, updateRequest }) => {
        const request = { ...validRequest, body: { imperialWeightOption, stone, pounds, poundsOnly } } as Request
        await action(request, res, next)
        expect(personalPageService.updatePhysicalAttributes).toHaveBeenCalledWith(
          expect.anything(),
          prisonUserMock,
          expect.anything(),
          expect.objectContaining(updateRequest),
        )
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#weight`)
        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Weight updated',
          type: FlashMessageType.success,
          fieldName: 'weight',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updatePhysicalAttributes = async () => {
          throw new Error()
        }

        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(validRequest.flash).toHaveBeenCalledWith('requestBody', JSON.stringify(validRequest.body))
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/weight/imperial`)
      })

      it.each(['stoneAndPounds', 'poundsOnly'])(
        'Sends a post success audit event for update type: %s',
        async (imperialWeightOption: string) => {
          const request = {
            ...validRequest,
            id: 1,
            body: { stone: '15', pounds: '2', poundsOnly: '212', imperialWeightOption },
          } as unknown as Request
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber,
            correlationId: request.id,
            action: PostAction.EditWeight,
            details: { fieldName: weightFieldData.fieldName, previous: 100, updated: 96 },
          }

          await action(request, res, next)

          expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
        },
      )
    })
  })
})
