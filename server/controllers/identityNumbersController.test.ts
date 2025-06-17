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
import {
  HomeOfficeIdentifierMappings,
  JusticeIdentifierMappings,
  PersonalIdentifierMappings,
} from '../data/constants/identifierMappings'
import { FlashMessageType } from '../data/enums/flashMessageType'
import { OffenderIdentifierType } from '../data/interfaces/prisonApi/OffenderIdentifier'

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

  describe.each([
    [
      'Add justice ID numbers',
      () => controller.addJusticeIdNumbers(),
      JusticeIdentifierMappings,
      Page.AddJusticeIdNumbers,
      'prisonLegacySystem',
    ],
    [
      'Add personal ID numbers',
      () => controller.addPersonalIdNumbers(),
      PersonalIdentifierMappings,
      Page.AddPersonalIdNumbers,
      'parkrun',
    ],
    [
      'Add Home Office ID numbers',
      () => controller.addHomeOfficeIdNumbers(),
      HomeOfficeIdentifierMappings,
      Page.AddHomeOfficeIdNumbers,
      'homeOfficeReference',
    ],
  ])('View edit page - %s', (title, action, pageData, pageViewEvent, existingValue) => {
    beforeEach(() => {
      jest.spyOn(identityNumbersService, 'getIdentityNumbers').mockResolvedValue(GetIdentifiersMock)
    })

    it('should render the add justice id numbers page', async () => {
      await action()(req, res, next)

      expect(identityNumbersService.getIdentityNumbers).toHaveBeenCalledWith('CLIENT_TOKEN', 'G6123VU')
      expect(res.render).toHaveBeenCalledWith('pages/identityNumbers/addIdentityNumbers', {
        pageTitle: `${title} - Prisoner personal details`,
        title,
        identifierOptions: buildIdentityNumberOptions({}, GetIdentifiersMock, pageData),
        errors: [],
        miniBannerData: {
          prisonerNumber: 'G6123VU',
          prisonerName: 'Saunders, John',
          cellLocation: '1-1-035',
        },
      })
    })

    it('should record a page view event', async () => {
      await action()(req, res, next)

      expect(auditService.sendPageView).toHaveBeenCalledWith({
        user: res.locals.user,
        prisonerNumber: 'G6123VU',
        prisonId: PrisonerMockDataA.prisonId,
        correlationId: req.id,
        page: pageViewEvent,
      })
    })

    it('should populate the page data from the request flash', async () => {
      const id = existingValue
      const { label } = pageData[existingValue]

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

      const identifierOptions = buildIdentityNumberOptions(flashValues, GetIdentifiersMock, pageData)

      await action()(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/identityNumbers/addIdentityNumbers', {
        pageTitle: `${title} - Prisoner personal details`,
        title,
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
        label,
        hasExistingValue: true,
        value: '1234',
        comment: 'Some comment',
      })
    })
  })

  describe.each([
    [
      'Justice identity numbers added',
      () => controller.postJusticeIdNumbers(),
      JusticeIdentifierMappings,
      'justice-id-numbers',
    ],
    [
      'Personal identity numbers added',
      () => controller.postPersonalIdNumbers(),
      PersonalIdentifierMappings,
      'personal-id-numbers',
    ],
    [
      'Home Office identity numbers added',
      () => controller.postHomeOfficeIdNumbers(),
      HomeOfficeIdentifierMappings,
      'home-office-id-numbers',
    ],
  ])('Submit ID numbers - %s', (flashMessage, action, pageData, errorRedirect) => {
    beforeEach(() => {
      req.body = {
        probationLegacySystem: {
          selected: '',
          value: '1234',
          comment: 'Some comment',
        },
        yjaf: {
          selected: '',
          value: '456',
        },
      }

      jest.spyOn(identityNumbersService, 'getIdentityNumbers').mockResolvedValue(GetIdentifiersMock)
      jest.spyOn(identityNumbersService, 'addIdentityNumbers').mockResolvedValue()
    })

    it('should add the new id numbers and redirect', async () => {
      const expectedRequest = [
        { comments: 'Some comment', type: OffenderIdentifierType.ProbationLegacySystemNumber, value: '1234' },
        { comments: undefined, type: OffenderIdentifierType.YjafNumber, value: '456' },
      ]

      await action()(req, res, next)

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
        text: flashMessage,
        type: FlashMessageType.success,
        fieldName: 'identity-numbers',
      })
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/G6123VU/personal#identity-numbers')
    })

    it('should detect duplicates of existing ids and redirect to the add justice numbers page ', async () => {
      req.body = {
        prisonLegacySystem: {
          selected: '',
          value: '1234',
          comment: 'Some comment',
        },
      }
      req.errors = []

      await action()(req, res, next)

      const { errors } = req

      expect(identityNumbersService.addIdentityNumbers).not.toHaveBeenCalled()
      expect(auditService.sendPostSuccess).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/G6123VU/personal/${errorRedirect}`)
      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual(
        'This Prison legacy system number already exists. Enter a different Prison legacy system number',
      )
      expect(errors[0].href).toEqual('#prisonLegacySystem-value-input')
    })

    it('should redirect to the add justice numbers page if an error is encountered', async () => {
      req.errors = [{ text: 'Some error' }]

      await action()(req, res, next)

      expect(identityNumbersService.addIdentityNumbers).not.toHaveBeenCalled()
      expect(auditService.sendPostSuccess).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/G6123VU/personal/${errorRedirect}`)
    })

    it('should handle bad request response from client', async () => {
      const apiError = {
        message: 'Bad request',
        status: 400,
        text: { errorMessage: 'Bad request', httpStatusCode: 400 },
      }
      jest.spyOn(identityNumbersService, 'addIdentityNumbers').mockRejectedValue(apiError)

      await action()(req, res, next)

      expect(auditService.sendPostSuccess).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/G6123VU/personal/${errorRedirect}`)
    })
  })
})
