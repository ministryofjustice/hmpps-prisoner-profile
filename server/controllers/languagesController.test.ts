import { Request, Response } from 'express'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import LanguagesController from './languagesController'
import LanguagesService from '../services/languagesService'
import { AuditService, Page, PostAction } from '../services/auditService'
import { FlashMessageType } from '../data/enums/flashMessageType'
import {
  LanguagePreferencesRequest,
  PersonCommunicationNeedsReferenceDataDomain,
  SecondaryLanguageRequest,
} from '../data/interfaces/personCommunicationNeedsApi/personCommunicationNeedsApiClient'
import {
  CommunicationNeedsDtoMock,
  LanguageRefDataMock,
} from '../data/localMockData/personCommunicationNeedsApiRefDataMock'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'

describe('LanguagesController', () => {
  let languagesService: LanguagesService
  let auditService: AuditService
  let controller: LanguagesController
  let req: Request
  let res: Response
  const prisonerNumber = 'A1234BC'
  const clientToken = 'CLIENT_TOKEN'

  beforeEach(() => {
    languagesService = {
      getCommunicationNeeds: jest.fn().mockReturnValue(CommunicationNeedsDtoMock),
      getReferenceData: jest.fn().mockReturnValue(LanguageRefDataMock),
      updateMainLanguage: jest.fn(),
      updateOtherLanguage: jest.fn(),
      deleteOtherLanguage: jest.fn(),
    } as Partial<LanguagesService> as LanguagesService

    auditService = auditServiceMock()

    controller = new LanguagesController(languagesService, auditService)

    req = {
      middleware: {
        prisonerData: {
          ...PrisonerMockDataA,
          prisonerNumber,
        },
        clientToken,
      },
      flash: jest.fn(),
      body: {},
      params: { offenderNo: prisonerNumber },
      id: 'request-id',
    } as Partial<Request> as Request

    res = {
      locals: {
        user: {
          username: 'USER1',
          staffId: 123,
        },
      },
      render: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('displayUpdateMainLanguage', () => {
    beforeEach(() => {
      req.flash = jest.fn().mockImplementation(key => {
        if (key === 'errors') return []
        return null
      })
    })

    it('should render the update main language page with the correct data', async () => {
      const handler = controller.displayUpdateMainLanguage()
      await handler(req, res, null)

      expect(languagesService.getCommunicationNeeds).toHaveBeenCalledWith(clientToken, prisonerNumber)
      expect(languagesService.getReferenceData).toHaveBeenCalledWith(clientToken, [
        PersonCommunicationNeedsReferenceDataDomain.language,
      ])

      expect(auditService.sendPageView).toHaveBeenCalledWith({
        user: res.locals.user,
        prisonerNumber,
        prisonId: PrisonerMockDataA.prisonId,
        correlationId: req.id,
        page: Page.EditMainLanguage,
      })

      expect(res.render).toHaveBeenCalledWith(
        'pages/languages/updateMainLanguage',
        expect.objectContaining({
          title: 'Main language',
          formValues: {
            preferredSpokenLanguageCode: 'ENG',
            preferredWrittenLanguageCode: 'ENG',
            interpreterRequired: false,
          },
          otherLanguages: CommunicationNeedsDtoMock.secondaryLanguages,
        }),
      )
    })

    it('should use form values from flash if available', async () => {
      const flashValues: LanguagePreferencesRequest = {
        preferredSpokenLanguageCode: 'SPA',
        preferredWrittenLanguageCode: 'FRE',
        interpreterRequired: true,
      }

      req.flash = jest.fn().mockImplementation(key => {
        if (key === 'errors') return []
        if (key === 'requestBody') return [JSON.stringify(flashValues)]
        return null
      })

      const handler = controller.displayUpdateMainLanguage()
      await handler(req, res, null)

      expect(res.render).toHaveBeenCalledWith(
        'pages/languages/updateMainLanguage',
        expect.objectContaining({
          formValues: flashValues,
        }),
      )
    })
  })

  describe('submitUpdateMainLanguage', () => {
    const formValues: LanguagePreferencesRequest = {
      preferredSpokenLanguageCode: 'ENG',
      preferredWrittenLanguageCode: 'ENG',
      interpreterRequired: false,
    }

    beforeEach(() => {
      req.body = {
        preferredSpokenLanguageCode: 'ENG',
        preferredWrittenLanguageCode: 'ENG',
        interpreterRequired: 'false',
      }
      req.flash = jest.fn()
    })

    it('should update the main language and redirect to the personal page', async () => {
      const handler = controller.submitUpdateMainLanguage()
      await handler(req, res, null)

      expect(languagesService.updateMainLanguage).toHaveBeenCalledWith(
        clientToken,
        res.locals.user,
        prisonerNumber,
        formValues,
      )

      expect(req.flash).toHaveBeenCalledWith('flashMessage', {
        text: 'Languages updated',
        type: FlashMessageType.success,
        fieldName: 'languages',
      })

      expect(auditService.sendPostSuccess).toHaveBeenCalledWith({
        user: res.locals.user,
        prisonerNumber,
        correlationId: req.id,
        action: PostAction.EditMainLanguage,
        details: {
          languagePreferences: formValues,
          previousLanguagePreferences: CommunicationNeedsDtoMock.languagePreferences,
        },
      })

      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#personal-details`)
    })

    it('should validate that interpreter required is selected', async () => {
      req.body = {
        preferredSpokenLanguageCode: 'ENG',
        preferredWrittenLanguageCode: 'ENG',
      }

      const handler = controller.submitUpdateMainLanguage()
      await handler(req, res, null)

      expect(req.flash).toHaveBeenCalledWith('errors', [
        {
          text: 'Select if an interpreter is required',
          href: '#interpreterRequired',
        },
      ])
      expect(req.flash).toHaveBeenCalledWith(
        'requestBody',
        JSON.stringify({
          preferredSpokenLanguageCode: 'ENG',
          preferredWrittenLanguageCode: 'ENG',
          interpreterRequired: undefined,
        }),
      )
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/main-language`)
    })

    it('should validate that main language is not in secondary languages', async () => {
      req.body = {
        preferredSpokenLanguageCode: 'FRE',
        preferredWrittenLanguageCode: 'FRE',
        interpreterRequired: 'false',
        preferredSpokenLanguageCodeError: 'DUPLICATE:French',
        preferredWrittenLanguageCodeError: 'DUPLICATE:French',
      }

      const handler = controller.submitUpdateMainLanguage()
      await handler(req, res, null)

      expect(req.flash).toHaveBeenCalledWith(
        'requestBody',
        JSON.stringify({
          preferredSpokenLanguageCode: 'FRE',
          preferredWrittenLanguageCode: 'FRE',
          interpreterRequired: false,
          preferredSpokenLanguageCodeError: 'DUPLICATE:French',
          preferredWrittenLanguageCodeError: 'DUPLICATE:French',
        }),
      )
      expect(req.flash).toHaveBeenCalledWith('errors', [
        {
          text: 'Language must be different from the saved languages',
          href: '#preferredSpokenLanguageCode',
        },
        {
          text: 'Language must be different from the saved languages',
          href: '#preferredWrittenLanguageCode',
        },
      ])
      expect(req.flash).toHaveBeenCalledWith('spokenInvalidInput', 'French')
      expect(req.flash).toHaveBeenCalledWith('writtenInvalidInput', 'French')
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/main-language`)
    })

    it('should validate that main language is a valid languages', async () => {
      req.body = {
        preferredSpokenLanguageCode: 'FRE',
        preferredWrittenLanguageCode: 'FRE',
        interpreterRequired: 'false',
        preferredSpokenLanguageCodeError: 'INVALID:Klingon',
        preferredWrittenLanguageCodeError: 'INVALID:Klingon',
      }

      const handler = controller.submitUpdateMainLanguage()
      await handler(req, res, null)

      expect(req.flash).toHaveBeenCalledWith(
        'requestBody',
        JSON.stringify({
          preferredSpokenLanguageCode: 'FRE',
          preferredWrittenLanguageCode: 'FRE',
          interpreterRequired: false,
          preferredSpokenLanguageCodeError: 'INVALID:Klingon',
          preferredWrittenLanguageCodeError: 'INVALID:Klingon',
        }),
      )
      expect(req.flash).toHaveBeenCalledWith('errors', [
        {
          text: 'This is not a valid language',
          href: '#preferredSpokenLanguageCode',
        },
        {
          text: 'This is not a valid language',
          href: '#preferredWrittenLanguageCode',
        },
      ])
      expect(req.flash).toHaveBeenCalledWith('spokenInvalidInput', 'Klingon')
      expect(req.flash).toHaveBeenCalledWith('writtenInvalidInput', 'Klingon')
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/main-language`)
    })

    it('should handle validation errors from the request', async () => {
      req.errors = [
        {
          text: 'This is an error',
          href: '#someField',
        },
      ]

      const handler = controller.submitUpdateMainLanguage()
      await handler(req, res, null)

      expect(req.flash).toHaveBeenCalledWith('errors', req.errors)
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/main-language`)
    })

    it('should set interpreterRequired to undefined if no spoken language is selected', async () => {
      req.body = {
        preferredSpokenLanguageCode: '',
        preferredWrittenLanguageCode: 'ENG',
        interpreterRequired: 'true',
      }

      const handler = controller.submitUpdateMainLanguage()
      await handler(req, res, null)

      expect(languagesService.updateMainLanguage).toHaveBeenCalledWith(clientToken, res.locals.user, prisonerNumber, {
        preferredSpokenLanguageCode: '',
        preferredWrittenLanguageCode: 'ENG',
        interpreterRequired: undefined,
      })
    })
  })

  describe('displayUpdateOtherLanguages', () => {
    beforeEach(() => {
      req.flash = jest.fn().mockImplementation(key => {
        if (key === 'errors') return []
        return null
      })
    })

    it('should render the update other languages page with the correct data', async () => {
      const handler = controller.displayUpdateOtherLanguages()
      await handler(req, res, null)

      expect(languagesService.getCommunicationNeeds).toHaveBeenCalledWith(clientToken, prisonerNumber)
      expect(languagesService.getReferenceData).toHaveBeenCalledWith(clientToken, [
        PersonCommunicationNeedsReferenceDataDomain.language,
      ])

      expect(auditService.sendPageView).toHaveBeenCalledWith({
        user: res.locals.user,
        prisonerNumber,
        prisonId: PrisonerMockDataA.prisonId,
        correlationId: req.id,
        page: Page.EditOtherLanguages,
      })

      expect(res.render).toHaveBeenCalledWith(
        'pages/languages/updateOtherLanguages',
        expect.objectContaining({
          title: 'Other languages',
          pageTitle: 'Other languages - Prisoner personal details',
          languageLabel: `Which other languages does John Saunders use?`,
          formValues: {
            language: undefined,
            canRead: undefined,
            canWrite: undefined,
            canSpeak: undefined,
          },
          miniBannerData: {
            prisonerNumber,
            prisonerName: 'Saunders, John',
          },
          errors: [],
          languageOptions: [
            { text: '', value: undefined },
            { text: 'Spanish', value: 'SPA' },
          ],
          mainLanguage: CommunicationNeedsDtoMock.languagePreferences,
          otherLanguages: CommunicationNeedsDtoMock.secondaryLanguages,
        }),
      )
    })

    it('should use form values from flash if available', async () => {
      const flashValues: SecondaryLanguageRequest = {
        language: 'SPA',
        canRead: true,
        canWrite: true,
        canSpeak: true,
      }

      req.flash = jest.fn().mockImplementation(key => {
        if (key === 'errors') return []
        if (key === 'requestBody') return [JSON.stringify(flashValues)]
        return null
      })

      const handler = controller.displayUpdateOtherLanguages()
      await handler(req, res, null)

      expect(res.render).toHaveBeenCalledWith(
        'pages/languages/updateOtherLanguages',
        expect.objectContaining({
          formValues: flashValues,
        }),
      )
    })
  })

  describe('submitUpdateOtherLanguages', () => {
    const formValues: SecondaryLanguageRequest = {
      language: 'ARA',
      canRead: true,
      canWrite: true,
      canSpeak: true,
    }

    beforeEach(() => {
      req.body = {
        language: 'ARA',
        languageSkills: ['canRead', 'canWrite', 'canSpeak'],
      }
      req.flash = jest.fn()
    })

    it('should update the other language and redirect to the personal page', async () => {
      const handler = controller.submitUpdateOtherLanguages()
      await handler(req, res, null)

      expect(languagesService.updateOtherLanguage).toHaveBeenCalledWith(
        clientToken,
        res.locals.user,
        prisonerNumber,
        formValues,
      )

      expect(req.flash).toHaveBeenCalledWith('flashMessage', {
        text: 'Languages updated',
        type: FlashMessageType.success,
        fieldName: 'languages',
      })

      expect(auditService.sendPostSuccess).toHaveBeenCalledWith({
        user: res.locals.user,
        prisonerNumber,
        correlationId: req.id,
        action: PostAction.EditOtherLanguages,
        details: {
          secondaryLanguages: formValues,
          previousSecondaryLanguages: CommunicationNeedsDtoMock.secondaryLanguages,
        },
      })

      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#personal-details`)
    })

    it('should validate that language is not in main or secondary languages', async () => {
      req.body = {
        language: 'ENG',
        languageSkills: ['canRead', 'canWrite', 'canSpeak'],
        languageError: 'DUPLICATE:English',
      }

      const handler = controller.submitUpdateOtherLanguages()
      await handler(req, res, null)

      expect(req.flash).toHaveBeenCalledWith(
        'requestBody',
        JSON.stringify({
          language: 'ENG',
          canSpeak: true,
          canWrite: true,
          canRead: true,
          languageError: 'DUPLICATE:English',
        }),
      )
      expect(req.flash).toHaveBeenCalledWith('errors', [
        {
          text: 'Language must be different from the saved languages',
          href: '#language',
        },
      ])
      expect(req.flash).toHaveBeenCalledWith('invalidInput', 'English')
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/other-languages`)
    })

    it('should validate that language is a valid language', async () => {
      req.body = {
        language: 'ENG',
        languageSkills: ['canRead', 'canWrite', 'canSpeak'],
        languageError: 'INVALID:Klingon',
      }

      const handler = controller.submitUpdateOtherLanguages()
      await handler(req, res, null)

      expect(req.flash).toHaveBeenCalledWith(
        'requestBody',
        JSON.stringify({
          language: 'ENG',
          canSpeak: true,
          canWrite: true,
          canRead: true,
          languageError: 'INVALID:Klingon',
        }),
      )
      expect(req.flash).toHaveBeenCalledWith('errors', [
        {
          text: 'This is not a valid language',
          href: '#language',
        },
      ])
      expect(req.flash).toHaveBeenCalledWith('invalidInput', 'Klingon')
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/other-languages`)
    })

    it('should handle validation errors from the request', async () => {
      req.errors = [
        {
          text: 'This is an error',
          href: '#someField',
        },
      ]

      const handler = controller.submitUpdateOtherLanguages()
      await handler(req, res, null)

      expect(req.flash).toHaveBeenCalledWith('errors', req.errors)
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal/other-languages`)
    })

    it('should delete the other language if no language is selected', async () => {
      req.body = {
        language: '',
        languageSkills: [],
      }
      const languageCode = 'ARA'
      req.params = { languageCode }

      const handler = controller.submitUpdateOtherLanguages()
      await handler(req, res, null)

      expect(languagesService.deleteOtherLanguage).toHaveBeenCalledWith(
        clientToken,
        res.locals.user,
        prisonerNumber,
        languageCode,
      )

      expect(req.flash).toHaveBeenCalledWith('flashMessage', {
        text: 'Languages updated',
        type: FlashMessageType.success,
        fieldName: 'languages',
      })

      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${prisonerNumber}/personal#personal-details`)
    })
  })
})
