import { NextFunction, Request, RequestHandler, Response } from 'express'
import { prisonUserMock } from '../../../../data/localMockData/user'
import { AuditService } from '../../../../services/auditService'
import { FlashMessageType } from '../../../../data/enums/flashMessageType'
import { cityOrTownOfBirthFieldData } from '../../fieldData'
import PersonalPageService from '../../../../services/personalPageService'
import { personalPageServiceMock } from '../../../../../tests/mocks/personalPageServiceMock'
import { auditServiceMock } from '../../../../../tests/mocks/auditServiceMock'
import CityOrTownOfBirthController from './cityOrTownOfBirthController'
import { inmateDetailMock } from '../../../../data/localMockData/inmateDetailMock'
import { PrisonerMockDataA } from '../../../../data/localMockData/prisoner'

describe('CityOrTownOfBirthController', () => {
  let personalPageService: PersonalPageService
  let auditService: AuditService
  let controller: CityOrTownOfBirthController
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

    controller = new CityOrTownOfBirthController(personalPageService, auditService)
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

  describe('cityOrTownOfBirthTextInput', () => {
    describe('edit', () => {
      const action: RequestHandler = async (req, response) =>
        controller.cityOrTownOfBirthTextInput().edit(req, response, next)

      it('Renders the default edit page with the correct data from the prison API', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware,
        } as unknown as Request
        await action(req, res, next)

        expect(res.render).toHaveBeenCalledWith('pages/edit/textField', {
          pageTitle: 'City or town of birth - Prisoner personal details',
          formTitle: 'City or town of birth',
          errors: [],
          hintText: cityOrTownOfBirthFieldData.hintText,
          inputClasses: cityOrTownOfBirthFieldData.inputClasses,
          fieldName: cityOrTownOfBirthFieldData.fieldName,
          fieldValue: 'La La Land',
          miniBannerData: {
            cellLocation: '1-1-035',
            prisonerName: 'Saunders, John',
            prisonerNumber,
            prisonerThumbnailImageUrl: `/api/prisoner/${prisonerNumber}/image?imageId=1413311&fullSizeImage=false`,
          },
          redirectAnchor: 'city-or-town-of-birth',
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
            return key === 'requestBody' ? [JSON.stringify({ cityOrTownOfBirth: 'SHEFFIELD' })] : []
          },
          middleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ fieldValue: 'SHEFFIELD' }))
      })
    })

    describe('submit', () => {
      let validRequest: Request
      const action: RequestHandler = async (req, response) =>
        controller.cityOrTownOfBirthTextInput().submit(req, response, next)

      beforeEach(() => {
        validRequest = {
          middleware,
          params: { prisonerNumber },
          body: { cityOrTownOfBirth: 'Sheffield' },
          flash: jest.fn(),
        } as unknown as Request
      })

      it.each([
        { cityOrTownOfBirth: '', updateRequest: null },
        { cityOrTownOfBirth: 'Rotherham', updateRequest: 'Rotherham' },
      ])('Valid request: %s', async ({ cityOrTownOfBirth, updateRequest }) => {
        const request = { ...validRequest, body: { cityOrTownOfBirth } } as Request
        await action(request, res, next)
        expect(personalPageService.updateCityOrTownOfBirth).toHaveBeenCalledWith(
          expect.anything(),
          prisonUserMock,
          expect.anything(),
          updateRequest,
        )
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#city-or-town-of-birth`)
        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'City or town of birth updated',
          type: FlashMessageType.success,
          fieldName: 'cityOrTownOfBirth',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updateCityOrTownOfBirth = async () => {
          throw new Error()
        }

        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/city-or-town-of-birth`)
      })
    })
  })
})
