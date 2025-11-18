import { RequestHandler } from 'express'
import { apostrophe, objectToSelectOptions, requestStringToBoolean } from '../utils/utils'
import { AuditService, Page, PostAction } from '../services/auditService'
import logger from '../../logger'
import LanguagesService from '../services/languagesService'
import {
  CommunicationNeedsDto,
  LanguagePreferencesRequest,
  PersonCommunicationNeedsReferenceDataDomain,
  SecondaryLanguageRequest,
} from '../data/interfaces/personCommunicationNeedsApi/personCommunicationNeedsApiClient'
import { PrisonUser } from '../interfaces/HmppsUser'
import { FlashMessageType } from '../data/enums/flashMessageType'
import { requestBodyFromFlash } from '../utils/requestBodyFromFlash'
import getCommonRequestData from '../utils/getCommonRequestData'

export default class LanguagesController {
  constructor(
    private readonly languagesService: LanguagesService,
    private readonly auditService: AuditService,
  ) {}

  public displayUpdateMainLanguage(): RequestHandler {
    return async (req, res) => {
      const { naturalPrisonerName, prisonerNumber, prisonId, clientToken, miniBannerData } = getCommonRequestData(
        req,
        res,
      )
      const errors = req.flash('errors')
      const spokenInvalidInput = req.flash('spokenInvalidInput')
      const writtenInvalidInput = req.flash('writtenInvalidInput')
      const requestBodyFlash = requestBodyFromFlash<LanguagePreferencesRequest>(req)

      const [communicationNeeds, languageReferenceCodes] = await Promise.all([
        this.languagesService.getCommunicationNeeds(clientToken, prisonerNumber),
        this.languagesService.getReferenceData(clientToken, [PersonCommunicationNeedsReferenceDataDomain.language]),
      ])

      const formValues: LanguagePreferencesRequest = requestBodyFlash || {
        preferredSpokenLanguageCode: communicationNeeds.languagePreferences?.preferredSpokenLanguage?.code,
        preferredWrittenLanguageCode: communicationNeeds.languagePreferences?.preferredWrittenLanguage?.code,
        interpreterRequired: communicationNeeds.languagePreferences?.interpreterRequired,
      }

      languageReferenceCodes.language = languageReferenceCodes.language?.filter(
        lang => !communicationNeeds.secondaryLanguages.some(secLang => secLang.language.code === lang.code),
      )

      const preferredSpokenLanguageOptions = [
        { value: undefined, text: '' },
        ...objectToSelectOptions(
          languageReferenceCodes.language ?? [],
          'code',
          'description',
          formValues.preferredSpokenLanguageCode,
        ),
      ]
      const preferredWrittenLanguageOptions = [
        { value: undefined, text: '' },
        ...objectToSelectOptions(
          languageReferenceCodes.language ?? [],
          'code',
          'description',
          formValues.preferredWrittenLanguageCode,
        ),
      ]

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.EditMainLanguage,
        })
        .catch(error => logger.error(error))

      return res.render('pages/languages/updateMainLanguage', {
        title: 'Main language',
        pageTitle: 'Main language - Prisoner personal details',
        mainLanguageLabel: `What is ${apostrophe(naturalPrisonerName)} main spoken language?`,
        autocompleteOptionHint: 'Start typing to select language.',
        formValues,
        errors,
        spokenInvalidInput,
        writtenInvalidInput,
        miniBannerData,
        preferredSpokenLanguageOptions,
        preferredWrittenLanguageOptions,
        otherLanguages: communicationNeeds.secondaryLanguages,
      })
    }
  }

  public submitUpdateMainLanguage(): RequestHandler {
    return async (req, res) => {
      const { clientToken, prisonerNumber } = getCommonRequestData(req, res)
      const {
        preferredSpokenLanguageCode,
        preferredWrittenLanguageCode,
        interpreterRequired,
        preferredSpokenLanguageCodeError,
        preferredWrittenLanguageCodeError,
      } = req.body
      const formValues: LanguagePreferencesRequest & {
        preferredSpokenLanguageCodeError?: string
        preferredWrittenLanguageCodeError?: string
      } = {
        preferredSpokenLanguageCode,
        preferredWrittenLanguageCode,
        interpreterRequired: requestStringToBoolean(interpreterRequired),
        preferredSpokenLanguageCodeError,
        preferredWrittenLanguageCodeError,
      }

      const communicationNeeds = await this.languagesService.getCommunicationNeeds(clientToken, prisonerNumber)
      const previousLanguagePreferences = communicationNeeds?.languagePreferences

      const languageErrors = this.checkMainLanguageForErrors(formValues, communicationNeeds)
      if (languageErrors.length) {
        req.flash('requestBody', JSON.stringify(formValues))
        req.flash('errors', languageErrors)
        req.flash('spokenInvalidInput', preferredSpokenLanguageCodeError)
        req.flash('writtenInvalidInput', preferredWrittenLanguageCodeError)
        return res.redirect(`/prisoner/${prisonerNumber}/personal/main-language`)
      }

      if (!formValues.preferredSpokenLanguageCode) {
        formValues.interpreterRequired = undefined
      }

      await this.languagesService.updateMainLanguage(
        clientToken,
        res.locals.user as PrisonUser,
        prisonerNumber,
        formValues,
      )

      req.flash('flashMessage', {
        text: 'Languages updated',
        type: FlashMessageType.success,
        fieldName: 'languages',
      })

      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.EditMainLanguage,
          details: { languagePreferences: formValues, previousLanguagePreferences },
        })
        .catch(error => logger.error(error))

      return res.redirect(`/prisoner/${prisonerNumber}/personal#main-language`)
    }
  }

  public displayUpdateOtherLanguages(): RequestHandler {
    return async (req, res) => {
      const { naturalPrisonerName, prisonerNumber, prisonId, clientToken, miniBannerData } = getCommonRequestData(
        req,
        res,
      )
      const { languageCode } = req.params
      const errors = req.flash('errors')
      const invalidInput = req.flash('invalidInput')
      const requestBodyFlash = requestBodyFromFlash<SecondaryLanguageRequest>(req)

      const [communicationNeeds, languageReferenceCodes] = await Promise.all([
        this.languagesService.getCommunicationNeeds(clientToken, prisonerNumber),
        this.languagesService.getReferenceData(clientToken, [PersonCommunicationNeedsReferenceDataDomain.language]),
      ])

      languageReferenceCodes.language = languageReferenceCodes.language?.filter(
        lang =>
          lang.code === languageCode ||
          (!communicationNeeds.secondaryLanguages.some(secLang => secLang.language.code === lang.code) &&
            lang.code !== communicationNeeds.languagePreferences?.preferredSpokenLanguage?.code &&
            lang.code !== communicationNeeds.languagePreferences?.preferredWrittenLanguage?.code),
      )

      const languageDto =
        languageCode && communicationNeeds.secondaryLanguages.find(lang => lang.language.code === languageCode)

      const formValues: SecondaryLanguageRequest = requestBodyFlash || {
        language: languageDto?.language?.code,
        canRead: languageDto?.canRead,
        canWrite: languageDto?.canWrite,
        canSpeak: languageDto?.canSpeak,
      }

      const languageOptions = [
        { value: undefined, text: '' },
        ...objectToSelectOptions(languageReferenceCodes.language ?? [], 'code', 'description', formValues.language),
      ]

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.EditOtherLanguages,
        })
        .catch(error => logger.error(error))

      return res.render('pages/languages/updateOtherLanguages', {
        title: 'Other languages',
        pageTitle: 'Other languages - Prisoner personal details',
        languageLabel: `Which other languages does ${naturalPrisonerName} use?`,
        autocompleteOptionHint: 'Start typing to select language.',
        formValues,
        errors,
        invalidInput,
        miniBannerData,
        languageOptions,
        mainLanguage: communicationNeeds.languagePreferences,
        otherLanguages: communicationNeeds.secondaryLanguages,
      })
    }
  }

  public submitUpdateOtherLanguages(): RequestHandler {
    return async (req, res) => {
      const { clientToken, prisonerNumber } = getCommonRequestData(req, res)
      const { languageCode } = req.params
      const { language, languageSkills, languageError, action } = req.body
      const formValues: SecondaryLanguageRequest & {
        languageError?: string
      } = {
        language,
        canSpeak: languageSkills?.includes('canSpeak'),
        canWrite: languageSkills?.includes('canWrite'),
        canRead: languageSkills?.includes('canRead'),
        languageError,
      }

      const communicationNeeds = await this.languagesService.getCommunicationNeeds(clientToken, prisonerNumber)
      const previousSecondaryLanguages = communicationNeeds?.secondaryLanguages

      const languageErrors = this.checkSecondaryLanguageForErrors(languageCode, formValues, communicationNeeds)
      if (languageErrors.length) {
        req.flash('requestBody', JSON.stringify(formValues))
        req.flash('errors', languageErrors)
        req.flash('invalidInput', languageError)
        return res.redirect(
          `/prisoner/${prisonerNumber}/personal/other-languages${languageCode ? `/${languageCode}` : ''}`,
        )
      }

      if (formValues.language) {
        await this.languagesService.updateOtherLanguage(
          clientToken,
          res.locals.user as PrisonUser,
          prisonerNumber,
          formValues,
        )
        if (languageCode && formValues.language !== languageCode) {
          await this.languagesService.deleteOtherLanguage(
            clientToken,
            res.locals.user as PrisonUser,
            prisonerNumber,
            languageCode,
          )
        }
      } else {
        await this.languagesService.deleteOtherLanguage(
          clientToken,
          res.locals.user as PrisonUser,
          prisonerNumber,
          languageCode,
        )
      }

      req.flash('flashMessage', {
        text: 'Languages updated',
        type: FlashMessageType.success,
        fieldName: 'languages',
      })

      const { languageError: unused, ...cleanFormValues } = formValues

      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.EditOtherLanguages,
          details: { secondaryLanguages: cleanFormValues, previousSecondaryLanguages },
        })
        .catch(error => logger.error(error))
      return res.redirect(
        action === 'another'
          ? `/prisoner/${prisonerNumber}/personal/other-languages`
          : `/prisoner/${prisonerNumber}/personal#other-languages`,
      )
    }
  }

  private checkMainLanguageForErrors(
    request: LanguagePreferencesRequest & {
      preferredSpokenLanguageCodeError?: string
      preferredWrittenLanguageCodeError?: string
    },
    communicationNeeds: CommunicationNeedsDto,
  ) {
    const errors = []
    const validationError = 'This is not a valid language'
    const duplicateError = 'Language must be different from the saved languages'
    const secondaryLanguages = communicationNeeds?.secondaryLanguages
      ?.map(lang => lang.language?.description?.toUpperCase())
      .filter(Boolean)

    if (request.preferredSpokenLanguageCodeError) {
      errors.push({
        text: secondaryLanguages.includes(request.preferredSpokenLanguageCodeError.trim().toUpperCase())
          ? duplicateError
          : validationError,
        href: '#preferred-spoken-language-code',
      })
    }

    if (request.preferredWrittenLanguageCodeError) {
      errors.push({
        text: secondaryLanguages.includes(request.preferredWrittenLanguageCodeError.trim().toUpperCase())
          ? duplicateError
          : validationError,
        href: '#preferred-written-language-code',
      })
    }

    return errors
  }

  private checkSecondaryLanguageForErrors(
    currentLanguageCode: string,
    request: SecondaryLanguageRequest & {
      languageError?: string
    },
    communicationNeeds: CommunicationNeedsDto,
  ) {
    const errors = []
    const validationError = 'This is not a valid language'
    const duplicateError = 'Language must be different from the saved languages'
    const mainSpokenLanguage =
      communicationNeeds?.languagePreferences?.preferredSpokenLanguage?.description?.toUpperCase()
    const mainWrittenLanguage =
      communicationNeeds?.languagePreferences?.preferredWrittenLanguage?.description?.toUpperCase()
    const secondaryLanguages = communicationNeeds?.secondaryLanguages
      ?.map(lang => lang.language?.description?.toUpperCase())
      .filter(Boolean)

    if (request.language === currentLanguageCode) return []

    if (request.languageError) {
      const formattedInputForComparison = request.languageError.trim().toUpperCase()
      const duplicate =
        mainSpokenLanguage === formattedInputForComparison ||
        mainWrittenLanguage === formattedInputForComparison ||
        secondaryLanguages.includes(formattedInputForComparison)

      errors.push({ text: duplicate ? duplicateError : validationError, href: '#language' })
    }

    return errors
  }
}
