import { NextFunction, Request, RequestHandler, Response } from 'express'
import { prisonUserMock } from '../../../../data/localMockData/user'
import { AuditService, Page, PostAction } from '../../../../services/auditService'
import { FlashMessageType } from '../../../../data/enums/flashMessageType'
import { nationalityFieldData } from '../../fieldData'
import PersonalPageService from '../../../../services/personalPageService'
import { personalPageServiceMock } from '../../../../../tests/mocks/personalPageServiceMock'
import { auditServiceMock } from '../../../../../tests/mocks/auditServiceMock'
import NationalityController from './nationalityController'
import { inmateDetailMock } from '../../../../data/localMockData/inmateDetailMock'
import { PrisonerMockDataA } from '../../../../data/localMockData/prisoner'
import { ProfileInformationType } from '../../../../data/interfaces/prisonApi/ProfileInformation'

describe('NationalityController', () => {
  let personalPageService: PersonalPageService
  let auditService: AuditService
  let controller: NationalityController
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

    controller = new NationalityController(personalPageService, auditService)
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

  describe('nationality', () => {
    describe('edit', () => {
      const action: RequestHandler = async (req, response) => controller.nationality().edit(req, response, next)

      it('Renders the default edit page with the correct data from the prison person API', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware,
        } as unknown as Request
        await action(req, res, next)

        expect(res.render).toHaveBeenCalledWith('pages/edit/nationality', {
          pageTitle: 'Nationality - Prisoner personal details',
          formTitle: `What is John Saunders's nationality?`,
          errors: [],
          radioOptions: expect.arrayContaining([expect.objectContaining({ text: 'British', value: 'BRIT' })]),
          autocompleteOptions: expect.arrayContaining([
            expect.objectContaining({ text: 'French', value: 'FREN' }),
            expect.objectContaining({ text: 'German', value: 'GERM' }),
          ]),
          additionalNationalitiesValue: 'Some other nationality',
          autocompleteSelected: false,
          autocompleteOptionTitle: 'A different nationality',
          autocompleteOptionLabel: 'Nationality',
          autocompleteOptionHint: 'Start typing to select nationality.',
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

      it('Populates the field value from the radio field using the flash', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (key: string) => {
            return key === 'requestBody' ? [JSON.stringify({ radioField: 'BRIT' })] : []
          },
          middleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            radioOptions: expect.arrayContaining([expect.objectContaining({ value: 'BRIT', checked: true })]),
          }),
        )
      })

      it('Populates the autocompleteSelected value from the flash when no autocomplete option is chosen', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (key: string) => {
            return key === 'requestBody' ? [JSON.stringify({ radioField: 'OTHER' })] : []
          },
          middleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            radioOptions: expect.arrayContaining([expect.objectContaining({ value: 'BRIT' })]),
            autocompleteSelected: true,
          }),
        )
      })

      it('Populates the field value from the autocomplete field using the flash', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (key: string) => {
            return key === 'requestBody' ? [JSON.stringify({ radioField: 'OTHER', autocompleteField: 'FREN' })] : []
          },
          middleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            radioOptions: expect.arrayContaining([expect.objectContaining({ value: 'BRIT' })]),
            autocompleteOptions: expect.arrayContaining([
              expect.objectContaining({ value: 'FREN', selected: true }),
              expect.objectContaining({ value: 'GERM' }),
            ]),
            autocompleteSelected: false,
          }),
        )
      })

      it('Populates the additional nationalities value from the flash', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (key: string) => {
            return key === 'requestBody' ? [JSON.stringify({ additionalNationalities: 'Some info' })] : []
          },
          middleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            additionalNationalitiesValue: 'Some info',
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
          page: Page.EditNationality,
        }

        await action(req, res, next)

        expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })

    describe('submit', () => {
      let validRequest: Request
      const action: RequestHandler = async (req, response) => controller.nationality().submit(req, response, next)

      beforeEach(() => {
        validRequest = {
          id: '1',
          middleware,
          params: { prisonerNumber },
          body: { radioField: 'BRIT' },
          flash: jest.fn(),
        } as unknown as Request
      })

      it('Updates the nationality', async () => {
        await action(validRequest, res, next)
        expect(personalPageService.updateNationality).toHaveBeenCalledWith(
          'token',
          prisonUserMock,
          prisonerNumber,
          'BRIT',
          null,
        )
      })

      it('Updates the nationality from the autocomplete field', async () => {
        const request = {
          ...validRequest,
          body: { radioField: 'OTHER', autocompleteField: 'FREN' },
        } as Request
        await action(request, res, next)
        expect(personalPageService.updateNationality).toHaveBeenCalledWith(
          'token',
          prisonUserMock,
          prisonerNumber,
          'FREN',
          null,
        )
      })

      it('Updates the other nationalities', async () => {
        const request = {
          ...validRequest,
          body: { radioField: 'BRIT', additionalNationalities: 'Updated nationalities' },
        } as Request
        await action(request, res, next)
        expect(personalPageService.updateNationality).toHaveBeenCalledWith(
          'token',
          prisonUserMock,
          prisonerNumber,
          'BRIT',
          'Updated nationalities',
        )
      })

      it('Redirects to the personal page #nationality on success', async () => {
        await action(validRequest, res, next)
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#nationality`)
      })

      it('Adds the success message to the flash', async () => {
        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Nationality updated',
          type: FlashMessageType.success,
          fieldName: 'nationality',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updateNationality = async () => {
          throw new Error()
        }

        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/nationality`)
      })

      it('Sends a post success audit event', async () => {
        const request = {
          ...validRequest,
          id: 1,
          body: { radioField: 'FREN', additionalNationalities: 'Updated nationalities' },
        } as unknown as Request
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber,
          correlationId: request.id,
          action: PostAction.EditNationality,
          details: [
            { fieldName: nationalityFieldData.fieldName, previous: 'BRIT', updated: 'FREN' },
            { fieldName: 'otherNationalities', previous: 'Some other nationality', updated: 'Updated nationalities' },
          ],
        }

        await action(request, res, next)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })
  })
})
