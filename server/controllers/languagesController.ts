import { Request, RequestHandler, Response } from 'express'
import { apostrophe, formatName, objectToSelectOptions, requestStringToBoolean } from '../utils/utils'
import { AuditService, Page, PostAction } from '../services/auditService'
import logger from '../../logger'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import LanguagesService from '../services/languagesService'
import {
  LanguagePreferencesRequest,
  PersonCommunicationNeedsReferenceDataDomain,
  SecondaryLanguageDto,
} from '../data/interfaces/personCommunicationNeedsApi/personCommunicationNeedsApiClient'
import { PrisonUser } from '../interfaces/HmppsUser'
import { FlashMessageType } from '../data/enums/flashMessageType'
import HmppsError from '../interfaces/HmppsError'
import { requestBodyFromFlash } from '../utils/requestBodyFromFlash'

export default class LanguagesController {
  constructor(
    private readonly languagesService: LanguagesService,
    private readonly auditService: AuditService,
  ) {}

  public displayUpdateMainLanguage(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerName, naturalPrisonerName, prisonerNumber, prisonId, clientToken } =
        this.getCommonRequestData(req)
      const errors = req.flash('errors')
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
        formValues,
        errors,
        miniBannerData: {
          prisonerNumber,
          prisonerName,
        },
        preferredSpokenLanguageOptions,
        preferredWrittenLanguageOptions,
        otherLanguages: communicationNeeds.secondaryLanguages,
      })
    }
  }

  public submitUpdateMainLanguage(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { clientToken, prisonerNumber } = this.getCommonRequestData(req)
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

      const errors = req.errors || []

      const { secondaryLanguages } = await this.languagesService.getCommunicationNeeds(clientToken, prisonerNumber)

      this.validate(formValues, secondaryLanguages, errors)

      if (errors.length) {
        req.flash('requestBody', JSON.stringify(formValues))
        req.flash('errors', errors)
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
          details: { formValues },
        })
        .catch(error => logger.error(error))

      return res.redirect(`/prisoner/${prisonerNumber}/personal#personal-details`)
    }
  }

  private validate(
    formValues: LanguagePreferencesRequest & {
      preferredSpokenLanguageCodeError?: string
      preferredWrittenLanguageCodeError?: string
    },
    secondaryLanguages: SecondaryLanguageDto[],
    errors: HmppsError[],
  ) {
    if (secondaryLanguages.some(lang => lang.language.code === formValues.preferredSpokenLanguageCode)) {
      errors.push({
        text: 'Language must be different from the saved languages',
        href: '#preferredSpokenLanguageCode',
      })
    } else if (formValues.preferredSpokenLanguageCodeError) {
      errors.push({
        text: 'This is not a valid language',
        href: '#preferredSpokenLanguageCode',
      })
    }
    if (formValues.interpreterRequired === undefined) {
      errors.push({
        text: 'Select if an interpreter is required',
        href: '#interpreterRequired',
      })
    }
    if (secondaryLanguages.some(lang => lang.language.code === formValues.preferredWrittenLanguageCode)) {
      errors.push({
        text: 'Language must be different from the saved languages',
        href: '#preferredWrittenLanguageCode',
      })
    } else if (formValues.preferredWrittenLanguageCodeError) {
      errors.push({
        text: 'This is not a valid language',
        href: '#preferredWrittenLanguageCode',
      })
    }
  }

  private getCommonRequestData(req: Request) {
    const { firstName, lastName, prisonerNumber, prisonId } = req.middleware.prisonerData
    const prisonerName = formatName(firstName, '', lastName, { style: NameFormatStyle.lastCommaFirst })
    const naturalPrisonerName = formatName(firstName, '', lastName, { style: NameFormatStyle.firstLast })
    const { clientToken } = req.middleware
    return { prisonerNumber, prisonId, prisonerName, naturalPrisonerName, clientToken }
  }
}
