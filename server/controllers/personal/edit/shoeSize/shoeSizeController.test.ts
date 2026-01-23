import { NextFunction, Request, RequestHandler, Response } from 'express'
import PersonalPageService from '../../../../services/personalPageService'
import { AuditService } from '../../../../services/auditService'
import ShoeSizeController from './shoeSizeController'
import { PrisonerMockDataA } from '../../../../data/localMockData/prisoner'
import { inmateDetailMock } from '../../../../data/localMockData/inmateDetailMock'
import { personalPageServiceMock } from '../../../../../tests/mocks/personalPageServiceMock'
import { corePersonPhysicalAttributesMock } from '../../../../data/localMockData/physicalAttributesMock'
import { auditServiceMock } from '../../../../../tests/mocks/auditServiceMock'
import { prisonUserMock } from '../../../../data/localMockData/user'
import { shoeSizeFieldData } from '../../fieldData'

describe('ShoeSizeController', () => {
  let personalPageService: PersonalPageService
  let auditService: AuditService
  let controller: ShoeSizeController
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

    controller = new ShoeSizeController(personalPageService, auditService)

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

  describe('shoeSize', () => {
    describe('edit', () => {
      const action: RequestHandler = async (req, response) => controller.shoeSize().edit(req, response, next)

      it('Renders the default edit page with the correct data', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware,
        } as unknown as Request

        await action(req, res, next)

        expect(personalPageService.getPhysicalAttributes).toHaveBeenCalledWith('token', prisonerNumber)

        expect(res.render).toHaveBeenCalledWith('pages/edit/shoeSize', {
          pageTitle: 'Shoe size - Prisoner personal details',
          formTitle: 'Enter shoe size',
          errors: [],
          hintText: shoeSizeFieldData.hintText,
          autocompleteOptions: expect.arrayContaining([
            {
              selected: true,
              text: 'UK 11 (EU 46)',
              value: '11',
            },
          ]),
          miniBannerData: {
            cellLocation: '1-1-035',
            prisonerName: 'Saunders, John',
            prisonerNumber,
            prisonerThumbnailImageUrl: `/api/prisoner/${prisonerNumber}/image?imageId=1413311&fullSizeImage=false`,
          },
          redirectAnchor: shoeSizeFieldData.redirectAnchor,
        })
      })

      test.each`
        sex         | shoeSize
        ${'Male'}   | ${'UK 11 (EU 46)'}
        ${'Female'} | ${'UK 11 (EU 44)'}
      `(`EU shoe size equivalent becomes: '$shoeSize' when prisoner sex is: '$sex'`, async ({ sex, shoeSize }) => {
        const req = {
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware: { ...middleware, prisonerData: { ...middleware.prisonerData, gender: sex } },
        } as unknown as Request

        await action(req, res, next)

        expect(res.render).toHaveBeenCalledWith(
          'pages/edit/shoeSize',
          expect.objectContaining({
            autocompleteOptions: expect.arrayContaining([
              {
                selected: true,
                text: shoeSize,
                value: '11',
              },
            ]),
          }),
        )
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
            return key === 'requestBody' ? [JSON.stringify({ autocompleteError: '1234' })] : []
          },
          middleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({ autocompleteError: '1234' }),
        )
      })
    })

    describe('submit', () => {
      let validRequest: Request
      const action: RequestHandler = async (req, response) => controller.shoeSize().submit(req, response, next)

      beforeEach(() => {
        validRequest = {
          middleware,
          params: { prisonerNumber },
          body: { autocompleteField: '10' },
          flash: jest.fn(),
        } as unknown as Request
      })

      it.each([
        { autocompleteField: '', updateRequest: { shoeSize: null } },
        { autocompleteField: '10', updateRequest: { shoeSize: '10' } },
      ])('Valid request: %s', async ({ autocompleteField, updateRequest }) => {
        const request = { ...validRequest, body: { autocompleteField } } as Request
        await action(request, res, next)
        expect(personalPageService.updatePhysicalAttributes).toHaveBeenCalledWith(
          expect.anything(),
          prisonUserMock,
          expect.anything(),
          expect.objectContaining(updateRequest),
        )
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#shoe-size`)
        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Shoe size updated',
          fieldName: 'shoeSize',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updatePhysicalAttributes = async () => {
          throw new Error()
        }

        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/shoe-size`)
      })
    })
  })
})
