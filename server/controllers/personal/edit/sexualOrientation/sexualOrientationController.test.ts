import { NextFunction, Request, RequestHandler, Response } from 'express'
import { prisonUserMock } from '../../../../data/localMockData/user'
import { AuditService, Page, PostAction } from '../../../../services/auditService'
import { FlashMessageType } from '../../../../data/enums/flashMessageType'
import PersonalPageService from '../../../../services/personalPageService'
import { personalPageServiceMock } from '../../../../../tests/mocks/personalPageServiceMock'
import { auditServiceMock } from '../../../../../tests/mocks/auditServiceMock'
import SexualOrientationController from './sexualOrientationController'
import { inmateDetailMock } from '../../../../data/localMockData/inmateDetailMock'
import { PrisonerMockDataA } from '../../../../data/localMockData/prisoner'
import { sexualOrientationFieldData } from '../../fieldData'
import { ProfileInformationType } from '../../../../data/interfaces/prisonApi/ProfileInformation'

describe('SexualOrientationController', () => {
  let personalPageService: PersonalPageService
  let auditService: AuditService
  let controller: SexualOrientationController
  let res: Response
  const next: NextFunction = jest.fn()

  const { prisonerNumber } = PrisonerMockDataA

  const middleware = {
    clientToken: 'token',
    prisonerData: PrisonerMockDataA,
    inmateDetail: {
      ...inmateDetailMock,
      profileInformation: [
        {
          question: 'Sexual orientation',
          resultValue: 'Heterosexual / Straight',
          type: ProfileInformationType.SexualOrientation,
        },
      ],
    },
  }

  beforeEach(() => {
    personalPageService = personalPageServiceMock() as PersonalPageService
    auditService = auditServiceMock()

    controller = new SexualOrientationController(personalPageService, auditService)
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

  describe('sexualOrientation', () => {
    describe('edit', () => {
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
          middleware,
        } as unknown as Request
        await action(req, res, next)

        expect(res.render).toHaveBeenCalledWith('pages/edit/radioField', {
          pageTitle: 'Sexual orientation - Prisoner personal details',
          formTitle: `Which of the following best describes John Saunders’ sexual orientation?`,
          hintText: undefined,
          errors: [],
          options: expectedOptions,
          redirectAnchor: 'sexual-orientation',
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
            return key === 'requestBody' ? [JSON.stringify({ radioField: 'HOM' })] : []
          },
          middleware,
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
          middleware,
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
          middleware,
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
})
