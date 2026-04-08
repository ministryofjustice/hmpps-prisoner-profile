import { NextFunction, Request, RequestHandler, Response } from 'express'
import PersonalPageService from '../../../../services/personalPageService'
import { AuditService, Page, PostAction } from '../../../../services/auditService'
import PhysicalCharacteristicsController from './physicalCharacteristicsController'
import { PrisonerMockDataA } from '../../../../data/localMockData/prisoner'
import { inmateDetailMock } from '../../../../data/localMockData/inmateDetailMock'
import { personalPageServiceMock } from '../../../../../tests/mocks/personalPageServiceMock'
import { corePersonPhysicalAttributesMock } from '../../../../data/localMockData/physicalAttributesMock'
import { auditServiceMock } from '../../../../../tests/mocks/auditServiceMock'
import { prisonUserMock } from '../../../../data/localMockData/user'
import { RadioFieldData } from '../../fieldData'
import { CorePersonRecordReferenceDataDomain } from '../../../../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { buildCodesMock } from '../../../../data/localMockData/personIntegrationApi/referenceDataMocks'
import { objectToRadioOptions } from '../../../../utils/utils'

describe('PhysicalCharacteristicsController', () => {
  let personalPageService: PersonalPageService
  let auditService: AuditService
  let controller: PhysicalCharacteristicsController
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

    controller = new PhysicalCharacteristicsController(personalPageService, auditService)

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
   * Tests for the generic radios edit pages - covers editing Hair type or colour, Facial hair, Face shape and Build
   */
  describe('physicalCharacteristicRadioField', () => {
    const fieldData: RadioFieldData = {
      pageTitle: 'Build',
      fieldName: 'build',
      code: 'buildCode',
      domain: CorePersonRecordReferenceDataDomain.build,
      auditEditPageLoad: 'PAGE' as Page,
      auditEditPostAction: 'ACTION' as PostAction,
      url: 'build',
      redirectAnchor: 'appearance',
      hintText: 'Hint text',
    }

    describe('edit', () => {
      const action: RequestHandler = async (req, response) =>
        controller.physicalCharacteristicRadioField(fieldData).edit(req, response, next)

      it('Renders the radios edit page with the field data config supplied', async () => {
        const req = {
          id: '1',
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware,
        } as unknown as Request

        await action(req, res, next)

        expect(personalPageService.getReferenceDataCodes).toHaveBeenCalledWith(
          'token',
          CorePersonRecordReferenceDataDomain.build,
        )
        expect(personalPageService.getPhysicalAttributes).toHaveBeenCalledWith('token', prisonerNumber)
        expect(res.render).toHaveBeenCalledWith('pages/edit/radioField', {
          pageTitle: 'Build - Prisoner personal details',
          formTitle: 'Build',
          errors: [],
          hintText: 'Hint text',
          options: objectToRadioOptions(buildCodesMock, 'code', 'description'),
          redirectAnchor: 'appearance',
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
            if (key === 'requestBody') return [JSON.stringify({ radioField: 'MEDIUM' })]
            return []
          },
          middleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            options: expect.arrayContaining([{ checked: true, text: 'Medium', value: 'MEDIUM' }]),
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
          page: fieldData.auditEditPageLoad,
        }

        await action(req, res, next)

        expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })

    describe('submit', () => {
      let validRequest: Request
      const action: RequestHandler = async (req, response) =>
        controller.physicalCharacteristicRadioField(fieldData).submit(req, response, next)

      beforeEach(() => {
        validRequest = {
          id: '1',
          middleware,
          params: { prisonerNumber },
          body: { radioField: 'MEDIUM' },
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
            buildCode: 'MEDIUM',
          },
        )
      })

      it('Redirects to the personal page #appearance on success', async () => {
        await action(validRequest, res, next)
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#appearance`)
      })

      it('Adds the success message to the flash', async () => {
        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Build updated',
          fieldName: 'build',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updatePhysicalAttributes = async () => {
          throw new Error()
        }

        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/build`)
      })

      it('Sends a post success audit event', async () => {
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber,
          correlationId: validRequest.id,
          action: 'ACTION',
          details: {
            fieldName: fieldData.fieldName,
            previous: corePersonPhysicalAttributesMock.buildCode,
            updated: 'MEDIUM',
          },
        }

        await action(validRequest, res, next)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })
  })
})
