import { NextFunction, Request, Response } from 'express'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import IdentityNumbersService from '../services/identityNumbersService'
import IdentityNumbersController from './identityNumbersController'
import { GetIdentifiersMock } from '../data/localMockData/getIdentifiersMock'
import { AuditService, Page, PostAction } from '../services/auditService'
import {
  AddIdentityNumberSubmission,
  buildIdentityNumberOptions,
} from './utils/identityNumbersController/buildIdentityNumberOptions'
import { JusticeIdentifierMappings } from '../data/constants/identifierMappings'
import { FlashMessageType } from '../data/enums/flashMessageType'

describe('IdentityNumbersController', () => {
  let req: Request
  let res: Response
  let next: NextFunction
  let identityNumbersService: IdentityNumbersService
  let auditService: AuditService
  let controller: IdentityNumbersController

  beforeEach(() => {
    req = {
      params: { prisonerNumber: 'G6123VU' },
      middleware: { clientToken: 'CLIENT_TOKEN', prisonerData: PrisonerMockDataA },
      flash: jest.fn().mockReturnValue([]),
      body: {},
    } as unknown as Request
    res = {
      locals: { user: { username: 'testuser' } },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
    next = jest.fn()
    identityNumbersService = {
      getIdentityNumbers: jest.fn(),
      addIdentityNumbers: jest.fn(),
    } as unknown as IdentityNumbersService
    auditService = auditServiceMock()
    controller = new IdentityNumbersController(identityNumbersService, auditService)
  })

  describe('addJusticeIdNumbers', () => {
    beforeEach(() => {
      jest.spyOn(identityNumbersService, 'getIdentityNumbers').mockResolvedValue(GetIdentifiersMock)
    })

    it('should render the add justice id numbers page', async () => {
      await controller.addJusticeIdNumbers()(req, res, next)

      expect(identityNumbersService.getIdentityNumbers).toHaveBeenCalledWith('CLIENT_TOKEN', 'G6123VU')
      expect(res.render).toHaveBeenCalledWith('pages/identityNumbers/addJusticeNumbers', {
        pageTitle: `Add justice ID numbers - Prisoner personal details`,
        title: `Add justice ID numbers`,
        identifierOptions: buildIdentityNumberOptions({}, GetIdentifiersMock, JusticeIdentifierMappings),
        errors: [],
        miniBannerData: {
          prisonerNumber: 'G6123VU',
          prisonerName: 'Saunders, John',
          cellLocation: '1-1-035',
        },
      })
    })

    it('should record a page view event', async () => {
      await controller.addJusticeIdNumbers()(req, res, next)

      expect(auditService.sendPageView).toHaveBeenCalledWith({
        user: res.locals.user,
        prisonerNumber: 'G6123VU',
        prisonId: PrisonerMockDataA.prisonId,
        correlationId: req.id,
        page: Page.AddJusticeIdNumbers,
      })
    })

    it('should populate the page data from the request flash', async () => {
      const id = 'prisonLegacySystem'
      const flashValues: Record<string, AddIdentityNumberSubmission> = {
        [id]: {
          selected: '',
          value: '1234',
          comment: 'Some comment',
        },
      }
      req.flash = jest.fn().mockImplementation(key => {
        if (key === 'errors') return []
        if (key === 'requestBody') return [JSON.stringify(flashValues)]
        return null
      })

      const identifierOptions = buildIdentityNumberOptions(flashValues, GetIdentifiersMock, JusticeIdentifierMappings)

      await controller.addJusticeIdNumbers()(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/identityNumbers/addJusticeNumbers', {
        pageTitle: `Add justice ID numbers - Prisoner personal details`,
        title: `Add justice ID numbers`,
        identifierOptions,
        errors: [],
        miniBannerData: {
          prisonerNumber: 'G6123VU',
          prisonerName: 'Saunders, John',
          cellLocation: '1-1-035',
        },
      })
      expect(identifierOptions.find(item => item.id === id)).toEqual({
        id,
        selected: true,
        label: 'Prison legacy system number',
        hasExistingValue: true,
        value: '1234',
        comment: 'Some comment',
      })
    })
  })

  describe('postJusticeIdNumbers', () => {
    beforeEach(() => {
      req.body = {
        prisonLegacySystem: {
          selected: '',
          value: '1234',
          comment: 'Some comment',
        },
        yjaf: {
          selected: '',
          value: '456',
        },
      }

      jest.spyOn(identityNumbersService, 'addIdentityNumbers').mockResolvedValue()
    })

    it('should add the new id numbers and redirect', async () => {
      const expectedRequest = [
        { comments: 'Some comment', type: 'HMPS', value: '1234' },
        { comments: undefined, type: 'YJAF', value: '456' },
      ]

      await controller.postJusticeIdNumbers()(req, res, next)

      expect(identityNumbersService.addIdentityNumbers).toHaveBeenCalledWith(
        'CLIENT_TOKEN',
        res.locals.user,
        'G6123VU',
        expectedRequest,
      )
      expect(auditService.sendPostSuccess).toHaveBeenCalledWith({
        user: res.locals.user,
        prisonerNumber: 'G6123VU',
        correlationId: req.id,
        action: PostAction.AddIdNumbers,
        details: { formValues: req.body },
      })
      expect(req.flash).toHaveBeenCalledWith('flashMessage', {
        text: 'Justice identity numbers added',
        type: FlashMessageType.success,
        fieldName: 'identity-numbers',
      })
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/G6123VU/personal#identity-numbers')
    })

    it('should redirect to the add justice numbers page if an error is encountered', async () => {
      req.errors = [{ text: 'Some error' }]

      await controller.postJusticeIdNumbers()(req, res, next)

      expect(identityNumbersService.addIdentityNumbers).not.toHaveBeenCalled()
      expect(auditService.sendPostSuccess).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/G6123VU/personal/justice-id-numbers')
    })

    it('should handle bad request response from client', async () => {
      const apiError = {
        message: 'Bad request',
        status: 400,
        text: { errorMessage: 'Bad request', httpStatusCode: 400 },
      }
      jest.spyOn(identityNumbersService, 'addIdentityNumbers').mockRejectedValue(apiError)

      await controller.postJusticeIdNumbers()(req, res, next)

      expect(auditService.sendPostSuccess).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/G6123VU/personal/justice-id-numbers')
    })
  })
})
