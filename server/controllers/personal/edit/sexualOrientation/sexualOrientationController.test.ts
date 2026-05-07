import { NextFunction, Request, RequestHandler, Response } from 'express'
import { auditServiceMock } from '../../../../../tests/mocks/auditServiceMock'
import { personalPageServiceMock } from '../../../../../tests/mocks/personalPageServiceMock'
import { AuditService, Page, PostAction } from '../../../../services/auditService'
import PersonalPageService from '../../../../services/personalPageService'
import SexualOrientationController from './sexualOrientationController'
import { sexualOrientationFieldData } from '../../fieldData'
import { prisonUserMock } from '../../../../data/localMockData/user'
import InmateDetail from '../../../../data/interfaces/prisonApi/InmateDetail'
import { ProfileInformationType } from '../../../../data/interfaces/prisonApi/ProfileInformation'

describe('SexualOrientationController', () => {
  let personalPageService: PersonalPageService
  let auditService: AuditService
  let controller: SexualOrientationController
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
    auditService = auditServiceMock()

    controller = new SexualOrientationController(personalPageService, auditService)
    res = { locals: defaultLocals, render: jest.fn(), redirect: jest.fn() } as unknown as Response
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
          formTitle: `Which of the following best describes First Last\u2019s sexual orientation?`,
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
