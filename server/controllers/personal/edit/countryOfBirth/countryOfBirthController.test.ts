import { NextFunction, Request, RequestHandler, Response } from 'express'
import { prisonUserMock } from '../../../../data/localMockData/user'
import { AuditService } from '../../../../services/auditService'
import { FlashMessageType } from '../../../../data/enums/flashMessageType'
import PersonalPageService from '../../../../services/personalPageService'
import { personalPageServiceMock } from '../../../../../tests/mocks/personalPageServiceMock'
import { auditServiceMock } from '../../../../../tests/mocks/auditServiceMock'
import CountryOfBirthController from './countryOfBirthController'
import { inmateDetailMock } from '../../../../data/localMockData/inmateDetailMock'
import { PrisonerMockDataA } from '../../../../data/localMockData/prisoner'

describe('CountryOfBirthController', () => {
  let personalPageService: PersonalPageService
  let auditService: AuditService
  let controller: CountryOfBirthController
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
    auditService = auditServiceMock()

    controller = new CountryOfBirthController(personalPageService, auditService)
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

  describe('countryOfBirth', () => {
    describe('edit', () => {
      const action: RequestHandler = async (req, response) => controller.countryOfBirth().edit(req, response, next)

      it('Renders the default edit page with the correct data from the prison API', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware,
        } as unknown as Request
        await action(req, res, next)

        expect(res.render).toHaveBeenCalledWith('pages/edit/radioFieldWithAutocomplete', {
          pageTitle: 'Country of birth - Prisoner personal details',
          formTitle: 'What country was John Saunders born in?',
          errors: [],
          radioOptions: [{ checked: true, value: 'ENG', text: 'England' }],
          autocompleteOptions: [{ value: 'FRA', text: 'France' }],
          autocompleteOptionTitle: 'A country outside the UK',
          autocompleteOptionLabel: 'Country',
          autocompleteOptionHint: 'Start typing to select country.',
          autocompleteSelected: false,
          miniBannerData: {
            cellLocation: '1-1-035',
            prisonerName: 'Saunders, John',
            prisonerNumber,
            prisonerThumbnailImageUrl: `/api/prisoner/${prisonerNumber}/image?imageId=1413311&fullSizeImage=false`,
          },
          redirectAnchor: 'country-of-birth',
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

      it('Populates the radio buttons from the flash', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (key: string) => {
            return key === 'requestBody' ? [JSON.stringify({ radioField: 'ENG' })] : []
          },
          middleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            autocompleteSelected: false,
            radioOptions: [{ checked: true, text: 'England', value: 'ENG' }],
          }),
        )
      })

      it('Populates the autocomplete from the flash', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (key: string) => {
            return key === 'requestBody' ? [JSON.stringify({ autocompleteField: 'FRA' })] : []
          },
          middleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            autocompleteOptions: [{ selected: true, text: 'France', value: 'FRA' }],
          }),
        )
      })

      it('Selects the autocomplete radio when the flash indicates an empty autocomplete field', async () => {
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
          expect.objectContaining({ autocompleteSelected: true }),
        )
      })
    })

    describe('submit', () => {
      let validRequest: Request
      const action: RequestHandler = async (req, response) => controller.countryOfBirth().submit(req, response, next)

      beforeEach(() => {
        validRequest = {
          middleware,
          params: { prisonerNumber },
          body: { radioField: 'ENG' },
          flash: jest.fn(),
        } as unknown as Request
      })

      it.each([
        { body: { radioField: 'ENG' }, updateRequest: 'ENG' },
        { body: { radioField: 'OTHER', autocompleteField: 'FRA' }, updateRequest: 'FRA' },
      ])('Valid request: %s', async ({ body, updateRequest }) => {
        const request = { ...validRequest, body } as Request
        await action(request, res, next)
        expect(personalPageService.updateCountryOfBirth).toHaveBeenCalledWith(
          expect.anything(),
          prisonUserMock,
          expect.anything(),
          updateRequest,
        )
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#country-of-birth`)
        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Country of birth updated',
          type: FlashMessageType.success,
          fieldName: 'countryOfBirth',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updateCountryOfBirth = async () => {
          throw new Error()
        }

        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/country-of-birth`)
      })
    })
  })
})
