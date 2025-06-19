import { NextFunction, Request, Response } from 'express'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import IdentityNumbersService from '../services/identityNumbersService'
import IdentityNumbersController, { EditIdentityNumberSubmission } from './identityNumbersController'
import { GetIdentifierMock, GetIdentifiersMock } from '../data/localMockData/getIdentifiersMock'
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

import { OffenderIdentifierType } from '../data/interfaces/prisonApi/OffenderIdentifierType'

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
      getIdentityNumber: jest.fn(),
      getIdentityNumbers: jest.fn(),
      addIdentityNumbers: jest.fn(),
      updateIdentityNumber: jest.fn(),
    } as unknown as IdentityNumbersService
    auditService = auditServiceMock()
    controller = new IdentityNumbersController(identityNumbersService, auditService)
  })

  describe.each([
    [
      'Add justice ID numbers',
      () => controller.justiceIdNumbers().edit,
      JusticeIdentifierMappings,
      Page.AddJusticeIdNumbers,
      'prisonLegacySystem',
    ],
    [
      'Add personal ID numbers',
      () => controller.personalIdNumbers().edit,
      PersonalIdentifierMappings,
      Page.AddPersonalIdNumbers,
      'parkrun',
    ],
    [
      'Add Home Office ID numbers',
      () => controller.homeOfficeIdNumbers().edit,
      HomeOfficeIdentifierMappings,
      Page.AddHomeOfficeIdNumbers,
      'homeOfficeReference',
    ],
  ])('View edit page - %s', (title, action, pageData, pageViewEvent, existingValue) => {
    beforeEach(() => {
      jest.spyOn(identityNumbersService, 'getIdentityNumbers').mockResolvedValue(GetIdentifiersMock)
    })

    it(`should render the ${title} page`, async () => {
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
    ['Justice identity numbers added', () => controller.justiceIdNumbers().submit, 'justice-id-numbers'],
    ['Personal identity numbers added', () => controller.personalIdNumbers().submit, 'personal-id-numbers'],
    ['Home Office identity numbers added', () => controller.homeOfficeIdNumbers().submit, 'home-office-id-numbers'],
  ])('Submit ID numbers - %s', (flashMessage, action, errorRedirect) => {
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

  describe.each([
    [OffenderIdentifierType.PncNumber, 'PNC number'],
    [OffenderIdentifierType.NationalInsuranceNumber, 'National Insurance number'],
    [OffenderIdentifierType.HomeOfficeReferenceNumber, 'Home Office reference number'],
  ])('View edit identity number page', (type: OffenderIdentifierType, typeLabel: string) => {
    const offenderId = 1
    const seqId = 1

    beforeEach(() => {
      req.params = {
        compositeId: `${offenderId}-${seqId}`,
        prisonerNumber: 'G6123VU',
      }
      jest.spyOn(identityNumbersService, 'getIdentityNumber').mockResolvedValue({
        ...GetIdentifierMock,
        type,
      })
    })

    it(`should render the page`, async () => {
      await controller.idNumber().edit(req, res)

      expect(identityNumbersService.getIdentityNumber).toHaveBeenCalledWith('CLIENT_TOKEN', offenderId, seqId)
      expect(res.render).toHaveBeenCalledWith('pages/identityNumbers/editIdentityNumber', {
        pageTitle: `${typeLabel} - Prisoner personal details`,
        title: `Change John Saunders’ ${typeLabel}`,
        formValues: { value: '2017/0239598Q', type, comment: 'Some comment' },
        identifierType: type,
        errors: [],
        miniBannerData: {
          prisonerNumber: 'G6123VU',
          prisonerName: 'Saunders, John',
          cellLocation: '1-1-035',
        },
      })
    })

    it('should record a page view event', async () => {
      await controller.idNumber().edit(req, res)

      expect(auditService.sendPageView).toHaveBeenCalledWith({
        user: res.locals.user,
        prisonerNumber: 'G6123VU',
        prisonId: PrisonerMockDataA.prisonId,
        correlationId: req.id,
        page: Page.EditIdNumber,
      })
    })

    it('should populate the page data from the request flash', async () => {
      const flashValues: EditIdentityNumberSubmission = {
        value: '2002/0073319Z',
        comment: 'Flash comment',
        type,
      }
      req.flash = jest.fn().mockImplementation(key => {
        if (key === 'errors') return []
        if (key === 'requestBody') return [JSON.stringify(flashValues)]
        return null
      })

      await controller.idNumber().edit(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/identityNumbers/editIdentityNumber', {
        pageTitle: `${typeLabel} - Prisoner personal details`,
        title: `Change John Saunders’ ${typeLabel}`,
        formValues: flashValues,
        identifierType: type,
        errors: [],
        miniBannerData: {
          prisonerNumber: 'G6123VU',
          prisonerName: 'Saunders, John',
          cellLocation: '1-1-035',
        },
      })
    })
  })

  describe.each([
    [OffenderIdentifierType.PncNumber, 'PNC number updated', 'pnc'],
    [OffenderIdentifierType.NationalInsuranceNumber, 'National Insurance number updated', 'national-insurance'],
    [OffenderIdentifierType.HomeOfficeReferenceNumber, 'Home Office reference number updated', 'home-office-reference'],
  ])('Submit ID number update', (type: OffenderIdentifierType, successFlash: string, editPageUrl: string) => {
    const offenderId = 1
    const seqId = 1

    beforeEach(() => {
      req.params = {
        compositeId: `${offenderId}-${seqId}`,
        prisonerNumber: 'G6123VU',
      }
      req.body = {
        value: '2002/0073319Z',
        comment: 'Some updated comment',
        type,
      }

      jest.spyOn(identityNumbersService, 'getIdentityNumbers').mockResolvedValue(GetIdentifiersMock)
      jest.spyOn(identityNumbersService, 'updateIdentityNumber').mockResolvedValue()
    })

    it('should update the existing id number and redirect', async () => {
      const expectedRequest = {
        comments: 'Some updated comment',
        value: '2002/0073319Z',
      }

      await controller.idNumber().submit(req, res, next)

      expect(identityNumbersService.updateIdentityNumber).toHaveBeenCalledWith(
        'CLIENT_TOKEN',
        res.locals.user,
        'G6123VU',
        offenderId,
        seqId,
        expectedRequest,
      )
      expect(auditService.sendPostSuccess).toHaveBeenCalledWith({
        user: res.locals.user,
        prisonerNumber: 'G6123VU',
        correlationId: req.id,
        action: PostAction.EditIdNumber,
        details: { formValues: req.body },
      })
      expect(req.flash).toHaveBeenCalledWith('flashMessage', {
        text: successFlash,
        type: FlashMessageType.success,
        fieldName: 'identity-numbers',
      })
      expect(res.redirect).toHaveBeenCalledWith('/prisoner/G6123VU/personal#identity-numbers')
    })

    it('should detect duplicates of existing ids and redirect to the edit identity number page ', async () => {
      req.body = {
        type: OffenderIdentifierType.PrisonLegacySystemNumber,
        value: '1234',
        comment: 'Some comment',
      }
      req.errors = []

      await controller.idNumber().submit(req, res, next)

      const { errors } = req

      expect(identityNumbersService.updateIdentityNumber).not.toHaveBeenCalled()
      expect(auditService.sendPostSuccess).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/G6123VU/personal/prison-legacy-system/1-1`)
      expect(errors.length).toEqual(1)
      expect(errors[0].text).toEqual(
        'This Prison legacy system number already exists. Enter a different Prison legacy system number',
      )
      expect(errors[0].href).toEqual('#identifier-value-input')
    })

    it('should redirect to the edit identity number page if an error is encountered', async () => {
      req.errors = [{ text: 'Some error' }]

      await controller.idNumber().submit(req, res, next)

      expect(identityNumbersService.updateIdentityNumber).not.toHaveBeenCalled()
      expect(auditService.sendPostSuccess).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/G6123VU/personal/${editPageUrl}/1-1`)
    })

    it('should handle bad request response from client', async () => {
      const apiError = {
        message: 'Bad request',
        status: 400,
        text: { errorMessage: 'Bad request', httpStatusCode: 400 },
      }
      jest.spyOn(identityNumbersService, 'updateIdentityNumber').mockRejectedValue(apiError)

      await controller.idNumber().submit(req, res, next)

      expect(auditService.sendPostSuccess).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/G6123VU/personal/${editPageUrl}/1-1`)
    })
  })
})
