import { NextFunction, Request, RequestHandler, Response } from 'express'
import PersonalPageService from '../../../../services/personalPageService'
import { AuditService, Page, PostAction } from '../../../../services/auditService'
import { PrisonerMockDataA } from '../../../../data/localMockData/prisoner'
import { inmateDetailMock } from '../../../../data/localMockData/inmateDetailMock'
import { personalPageServiceMock } from '../../../../../tests/mocks/personalPageServiceMock'
import { corePersonPhysicalAttributesMock } from '../../../../data/localMockData/physicalAttributesMock'
import { auditServiceMock } from '../../../../../tests/mocks/auditServiceMock'
import { prisonUserMock } from '../../../../data/localMockData/user'
import { heightFieldData } from '../../fieldData'
import { CorePersonPhysicalAttributes } from '../../../../services/interfaces/corePerson/corePersonPhysicalAttributes'
import HeightController from './heightController'

describe('ShoeSizeController', () => {
  let personalPageService: PersonalPageService
  let auditService: AuditService
  let controller: HeightController
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

    controller = new HeightController(personalPageService, auditService)

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

  describe('height', () => {
    describe('metric', () => {
      describe('edit', () => {
        const action: RequestHandler = async (req, response) => controller.height().metric.edit(req, response, next)

        it('Renders the default edit page with the correct data from the prison person API', async () => {
          const req = {
            params: { prisonerNumber },
            flash: (): string[] => [],
            middleware,
          } as unknown as Request
          await action(req, res, next)

          expect(personalPageService.getPhysicalAttributes).toHaveBeenCalledWith('token', prisonerNumber)
          expect(res.render).toHaveBeenCalledWith('pages/edit/heightMetric', {
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
              return key === 'requestBody' ? [JSON.stringify({ editField: '1234' })] : []
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
            page: Page.EditHeight,
          }

          await action(req, res, next)

          expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })

      describe('submit', () => {
        let validRequest: Request
        const action: RequestHandler = async (req, response) => controller.height().metric.submit(req, response, next)

        beforeEach(() => {
          validRequest = {
            middleware,
            params: { prisonerNumber },
            body: { editField: '123' },
            flash: jest.fn(),
          } as unknown as Request
        })

        it.each([
          { editField: '', updateRequest: { height: null } },
          { editField: '100', updateRequest: { height: 100 } },
        ])('Valid request: %s', async ({ editField, updateRequest }) => {
          const request = { ...validRequest, body: { editField } } as Request
          await action(request, res, next)
          expect(personalPageService.updatePhysicalAttributes).toHaveBeenCalledWith(
            expect.anything(),
            prisonUserMock,
            expect.anything(),
            expect.objectContaining(updateRequest),
          )
          expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#height`)
          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Height updated',
            fieldName: 'height',
          })
        })

        it('Handles API errors', async () => {
          personalPageService.updatePhysicalAttributes = async () => {
            throw new Error()
          }

          await action(validRequest, res, next)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
          expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/height`)
        })

        it('Sends a post success audit event', async () => {
          const request = { ...validRequest, id: 1, body: { editField: 157 } } as unknown as Request
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber,
            correlationId: request.id,
            action: PostAction.EditHeight,
            details: { fieldName: heightFieldData.fieldName, previous: 100, updated: 157 },
          }

          await action(request, res, next)

          expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })
    })

    describe('imperial', () => {
      describe('edit', () => {
        const action: RequestHandler = async (req, response) => controller.height().imperial.edit(req, response, next)

        it('Renders the default edit page with the correct data', async () => {
          const req = {
            params: { prisonerNumber },
            flash: (): string[] => [],
            middleware,
          } as unknown as Request
          await action(req, res, next)

          expect(res.render).toHaveBeenCalledWith('pages/edit/heightImperial', {
            pageTitle: expect.anything(),
            errors: [],
            feetValue: 3,
            inchesValue: 3,
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
              return key === 'requestBody' ? [JSON.stringify({ feet: '5', inches: '10' })] : []
            },
            middleware,
          } as unknown as Request
          await action(req, res, next)
          expect(res.render).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ feetValue: '5', inchesValue: '10' }),
          )
        })

        it('Keeps the inputs empty when no height exists', async () => {
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
            expect.objectContaining({ feetValue: undefined, inchesValue: undefined }),
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
            page: Page.EditHeight,
          }

          await action(req, res, next)

          expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })

      describe('submit', () => {
        let validRequest: Request
        const action: RequestHandler = async (req, response) => controller.height().imperial.submit(req, response, next)

        beforeEach(() => {
          validRequest = {
            middleware,
            params: { prisonerNumber },
            body: { feet: '5', inches: '10' },
            flash: jest.fn(),
          } as unknown as Request
        })

        it.each([
          { feet: '', inches: '', updateRequest: { height: null } },
          { feet: '5', inches: '2', updateRequest: { height: 157 } },
          { feet: '3', inches: '', updateRequest: { height: 91 } },
        ])('Valid request updates physical attributes: %s', async ({ feet, inches, updateRequest }) => {
          const request = { ...validRequest, body: { feet, inches } } as Request
          await action(request, res, next)
          expect(personalPageService.updatePhysicalAttributes).toHaveBeenCalledWith(
            expect.anything(),
            prisonUserMock,
            expect.anything(),
            expect.objectContaining(updateRequest),
          )
          expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#height`)
          expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
            text: 'Height updated',
            fieldName: 'height',
          })
        })

        it('Handles API errors', async () => {
          personalPageService.updatePhysicalAttributes = async () => {
            throw new Error()
          }

          await action(validRequest, res, next)

          expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
          expect(validRequest.flash).toHaveBeenCalledWith('requestBody', JSON.stringify(validRequest.body))
          expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/height/imperial`)
        })

        it('Sends a post success audit event', async () => {
          const request = { ...validRequest, id: 1, body: { feet: '5', inches: '2' } } as unknown as Request
          const expectedAuditEvent = {
            user: prisonUserMock,
            prisonerNumber,
            correlationId: request.id,
            action: PostAction.EditHeight,
            details: { fieldName: heightFieldData.fieldName, previous: 100, updated: 157 },
          }

          await action(request, res, next)

          expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
        })
      })
    })
  })
})
