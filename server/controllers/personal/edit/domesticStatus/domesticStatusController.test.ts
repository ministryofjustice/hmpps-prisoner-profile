import { NextFunction, Request, RequestHandler, Response } from 'express'
import { prisonUserMock } from '../../../../data/localMockData/user'
import { AuditService, Page, PostAction } from '../../../../services/auditService'
import PersonalPageService from '../../../../services/personalPageService'
import { personalPageServiceMock } from '../../../../../tests/mocks/personalPageServiceMock'
import { auditServiceMock } from '../../../../../tests/mocks/auditServiceMock'
import { inmateDetailMock } from '../../../../data/localMockData/inmateDetailMock'
import { PrisonerMockDataA } from '../../../../data/localMockData/prisoner'
import { ProfileInformationType } from '../../../../data/interfaces/prisonApi/ProfileInformation'
import DomesticStatusController from './domesticStatusController'
import { ReferenceDataCodeDto } from '../../../../data/interfaces/referenceData'
import { FlashMessageType } from '../../../../data/enums/flashMessageType'
import { domesticStatusFieldData } from '../../fieldData'
import { PersonalRelationshipsDomesticStatusMock } from '../../../../data/localMockData/personalRelationshipsApiMock'

describe('NationalityController', () => {
  let personalPageService: PersonalPageService
  let auditService: AuditService
  let controller: DomesticStatusController
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
    personalPageService.getDomesticStatus = jest.fn(async () => PersonalRelationshipsDomesticStatusMock)

    auditService = auditServiceMock()

    controller = new DomesticStatusController(personalPageService, auditService)
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
          middleware,
        } as unknown as Request
        await action(req, res, next)

        expect(res.render).toHaveBeenCalledWith('pages/edit/radioField', {
          pageTitle: 'Marital or civil partnership status - Prisoner personal details',
          formTitle: `What is John Saunders’ marital or civil partnership status?`,
          hintText: undefined,
          errors: [],
          options: expectedOptions,
          redirectAnchor: 'marriage-or-civil-partnership-status',
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
            return key === 'requestBody' ? [JSON.stringify({ radioField: 'M' })] : []
          },
          middleware,
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
          middleware,
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
          middleware,
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
})
