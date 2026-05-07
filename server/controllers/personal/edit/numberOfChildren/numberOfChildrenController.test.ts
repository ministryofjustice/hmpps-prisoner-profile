import { NextFunction, Request, RequestHandler, Response } from 'express'
import PersonalPageService from '../../../../services/personalPageService'
import { AuditService, Page, PostAction } from '../../../../services/auditService'
import { personalPageServiceMock } from '../../../../../tests/mocks/personalPageServiceMock'
import { auditServiceMock } from '../../../../../tests/mocks/auditServiceMock'
import { prisonUserMock } from '../../../../data/localMockData/user'
import { numberOfChildrenFieldData } from '../../fieldData'
import { PersonalRelationshipsNumberOfChildrenMock } from '../../../../data/localMockData/personalRelationshipsApiMock'
import InmateDetail from '../../../../data/interfaces/prisonApi/InmateDetail'
import { ProfileInformationType } from '../../../../data/interfaces/prisonApi/ProfileInformation'
import NumberOfChildrenController from './numberOfChildrenController'

describe('NumberOfChildrenController', () => {
  let personalPageService: PersonalPageService
  let auditService: AuditService
  let controller: NumberOfChildrenController
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
    personalPageService.getNumberOfChildren = jest.fn(async () => PersonalRelationshipsNumberOfChildrenMock)

    controller = new NumberOfChildrenController(personalPageService, auditService)
    res = { locals: defaultLocals, render: jest.fn(), redirect: jest.fn() } as unknown as Response
  })

  describe('Number of children', () => {
    describe('Edit', () => {
      const action: RequestHandler = async (req, response) => controller.numberOfChildren().edit(req, response, next)

      it('Renders the default edit page with the correct data from the prison person API', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (): string[] => [],
          middleware: defaultMiddleware,
        } as unknown as Request
        await action(req, res, next)

        expect(res.render).toHaveBeenCalledWith('pages/edit/children', {
          pageTitle: 'Children - Prisoner personal details',
          formTitle: `Does First Last have any children?`,
          errors: [],
          redirectAnchor: 'number-of-children',
          miniBannerData: {
            cellLocation: '2-3-001',
            prisonerName: 'Last, First',
            prisonerNumber,
            prisonerThumbnailImageUrl: `/api/prisoner/${prisonerNumber}/image?imageId=undefined&fullSizeImage=false`,
          },
          radioFieldValue: 'YES',
          currentNumberOfChildren: '2',
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

      it('Populates the field values from the flash', async () => {
        const req = {
          params: { prisonerNumber },
          flash: (key: string) => {
            return key === 'requestBody' ? [JSON.stringify({ hasChildren: 'YES', numberOfChildren: '4' })] : []
          },
          middleware: defaultMiddleware,
        } as unknown as Request
        await action(req, res, next)
        expect(res.render).toHaveBeenCalledWith(
          expect.anything(),
          expect.objectContaining({
            radioFieldValue: 'YES',
            currentNumberOfChildren: '4',
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
          page: Page.EditNumberOfChildren,
        }

        await action(req, res, next)

        expect(auditService.sendPageView).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })

    describe('submit', () => {
      let validRequest: Request
      const action: RequestHandler = async (req, response) => controller.numberOfChildren().submit(req, response, next)

      beforeEach(() => {
        validRequest = {
          id: '1',
          middleware: defaultMiddleware,
          params: { prisonerNumber },
          body: { hasChildren: 'YES', numberOfChildren: '5' },
          flash: jest.fn(),
        } as unknown as Request

        personalPageService.updateNumberOfChildren = jest.fn()
      })

      it('Updates the number of children', async () => {
        await action(validRequest, res, next)
        expect(personalPageService.updateNumberOfChildren).toHaveBeenCalledWith(
          'token',
          prisonUserMock,
          prisonerNumber,
          5,
        )
      })

      it(`Updates the number of children to 0 if 'NO' selected as answer`, async () => {
        await action(
          {
            ...validRequest,
            body: { hasChildren: 'NO' },
          } as Request,
          res,
          next,
        )
        expect(personalPageService.updateNumberOfChildren).toHaveBeenCalledWith(
          'token',
          prisonUserMock,
          prisonerNumber,
          0,
        )
      })

      it('Redirects to the personal page #number-of-children on success', async () => {
        await action(validRequest, res, next)
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#number-of-children`)
      })

      it('Adds the success message to the flash', async () => {
        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('flashMessage', {
          text: 'Number of children updated',
          fieldName: 'numberOfChildren',
        })
      })

      it('Handles API errors', async () => {
        personalPageService.updateNumberOfChildren = async () => {
          throw new Error()
        }

        await action(validRequest, res, next)

        expect(validRequest.flash).toHaveBeenCalledWith('errors', [{ text: expect.anything() }])
        expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/children`)
      })

      it('Sends a post success audit event', async () => {
        const request = {
          ...validRequest,
          id: 1,
          body: { hasChildren: 'YES', numberOfChildren: '5' },
        } as unknown as Request
        const expectedAuditEvent = {
          user: prisonUserMock,
          prisonerNumber,
          correlationId: request.id,
          action: PostAction.EditNumberOfChildren,
          details: { fieldName: numberOfChildrenFieldData.fieldName, previous: '2', updated: '5' },
        }

        await action(request, res, next)

        expect(auditService.sendPostSuccess).toHaveBeenCalledWith(expectedAuditEvent)
      })
    })
  })
})
