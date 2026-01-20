import { NextFunction, Request, RequestHandler, Response } from 'express'
import { prisonUserMock } from '../../../../data/localMockData/user'
import { AuditService, Page, PostAction } from '../../../../services/auditService'
import { FlashMessageType } from '../../../../data/enums/flashMessageType'
import { smokerOrVaperFieldData } from '../../fieldData'
import PersonalPageService from '../../../../services/personalPageService'
import { personalPageServiceMock } from '../../../../../tests/mocks/personalPageServiceMock'
import { auditServiceMock } from '../../../../../tests/mocks/auditServiceMock'
import SmokerOrVaperController from './smokerOrVaperController'
import { inmateDetailMock } from '../../../../data/localMockData/inmateDetailMock'
import { PrisonerMockDataA } from '../../../../data/localMockData/prisoner'
import { ProfileInformationType } from '../../../../data/interfaces/prisonApi/ProfileInformation'

describe('SmokerOrVaperController', () => {
  let personalPageService: PersonalPageService
  let auditService: AuditService
  let controller: SmokerOrVaperController
  let res: Response
  const next: NextFunction = jest.fn()

  const { prisonerNumber } = PrisonerMockDataA

  const middleware = {
    clientToken: 'token',
    prisonerData: PrisonerMockDataA,
    inmateDetail: {
      ...inmateDetailMock,
      profileInformation: [
        { question: 'Smoker or Vaper', resultValue: 'Yes', type: ProfileInformationType.SmokerOrVaper },
      ],
    },
  }

  beforeEach(() => {
    personalPageService = personalPageServiceMock() as PersonalPageService
    auditService = auditServiceMock()

    controller = new SmokerOrVaperController(personalPageService, auditService)
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

  describe('smokerOrVaper', () => {
    describe('edit', () => {
      const action: RequestHandler = async (req, response) => controller.smokerOrVaper().edit(req, response, next)

      it('Renders the default edit page with the correct data from the prison person API', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware,
        } as unknown as Request
        await action(req, res, next)

        expect(res.render).toHaveBeenCalledWith('pages/edit/radioField', {
          pageTitle: 'Smoker or vaper - Prisoner personal details',
          formTitle: 'Does John Saunders smoke or vape?',
          hintText: undefined,
          errors: [],
          options: expect.arrayContaining([
            expect.objectContaining({ value: 'SMOKER_YES' }),
            expect.objectContaining({ value: 'SMOKER_VAPER' }),
            expect.objectContaining({ value: 'SMOKER_NO' }),
          ]),
          redirectAnchor: 'smoking-and-vaping',
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
            return key === 'requestBody' ? [JSON.stringify({ radioField: 'SMOKER_NO' })] : []
          },
          middleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expect.arrayContaining([expect.objectContaining({ value: 'SMOKER_NO', checked: true })]),
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
          page: Page.EditSmokerOrVaper,
        }

        await action(req, res, next)

        expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })

    describe('submit', () => {
      let validRequest: Request
      const action: RequestHandler = async (req, response) => controller.smokerOrVaper().submit(req, response, next)

      beforeEach(() => {
        validRequest = {
          id: '1',
          middleware,
          params: { prisonerNumber },
          body: { radioField: 'SMOKE_NO' },
          flash: jest.fn(),
        } as unknown as Request
      })

      it('Updates the smoker or vaper', async () => {
        await action(validRequest, res, next)
        expect(personalPageService.updateSmokerOrVaper).toHaveBeenCalledWith(
          'token',
          prisonUserMock,
          prisonerNumber,
          'SMOKE_NO',
        )
      })

      it('Redirects to the personal page #smoking-and-vaping on success', async () => {
        await action(validRequest, res, next)
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#smoking-and-vaping`)
      })

      it('Adds the success message to the flash', async () => {
        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Smoking and vaping updated',
          type: FlashMessageType.success,
          fieldName: 'smokerOrVaper',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updateSmokerOrVaper = async () => {
          throw new Error()
        }

        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/smoker-or-vaper`)
      })

      it('Sends a post success audit event', async () => {
        const request = { ...validRequest, id: 1, body: { radioField: 'SMOKER_NO' } } as unknown as Request
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber,
          correlationId: request.id,
          action: PostAction.EditSmokerOrVaper,
          details: { fieldName: smokerOrVaperFieldData.fieldName, previous: 'SMOKER_YES', updated: 'SMOKER_NO' },
        }

        await action(request, res, next)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })
  })
})
