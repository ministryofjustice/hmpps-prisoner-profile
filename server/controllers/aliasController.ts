import { NextFunction, Request, RequestHandler, Response } from 'express'
import { apostrophe, formatName, formatNamePart } from '../utils/utils'
import { AuditService, Page, PostAction } from '../services/auditService'
import logger from '../../logger'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { FlashMessageType } from '../data/enums/flashMessageType'
import AliasService, { Name } from '../services/aliasService'
import { requestBodyFromFlash } from '../utils/requestBodyFromFlash'
import { PrisonUser } from '../interfaces/HmppsUser'
import {
  CorePersonRecordReferenceDataDomain,
  PseudonymRequestDto,
  PseudonymResponseDto,
} from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { dateToIsoDate } from '../utils/dateHelpers'
import {
  getEthnicBackgroundRadioOptions,
  getEthnicGroupDescription,
  getEthnicGroupDescriptionForHeading,
  getEthnicGroupRadioOptions,
} from './utils/alias/ethnicityUtils'
import ReferenceDataService from '../services/referenceData/referenceDataService'

interface DateOfBirthForm {
  'dateOfBirth-year': string
  'dateOfBirth-month': string
  'dateOfBirth-day': string
}

export default class AliasController {
  constructor(
    private readonly aliasService: AliasService,
    private readonly referenceDataService: ReferenceDataService,
    private readonly auditService: AuditService,
  ) {}

  public displayChangeNamePurpose(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerName, titlePrisonerName, prisonerNumber, prisonId } = this.getCommonRequestData(req)
      const errors = req.flash('errors')

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.EditNamePurpose,
        })
        .catch(error => logger.error(error))

      return res.render('pages/edit/radioField', {
        pageTitle: `Why are you changing this person’s name? - Prisoner personal details`,
        formTitle: `Why are you changing ${apostrophe(titlePrisonerName)} name?`,
        submitButtonText: 'Continue',
        options: [
          {
            value: 'name-wrong',
            text: 'Their current name is wrong',
            hint: { text: 'For example, if it contains a typo or is missing a middle name.' },
          },
          {
            value: 'name-changed',
            text: 'Their name has legally changed',
            hint: { text: 'For example, if they have taken their spouse’s or civil partner’s last name.' },
          },
        ],
        errors,
        prisonerNumber,
        breadcrumbPrisonerName: prisonerName,
        miniBannerData: {
          prisonerNumber,
          prisonerName,
        },
      })
    }
  }

  public submitChangeNamePurpose(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { titlePrisonerName, prisonerNumber } = this.getCommonRequestData(req)
      const { radioField: purpose } = req.body

      if (!purpose) {
        req.flash('errors', [
          { text: `Select why you’re changing ${apostrophe(titlePrisonerName)} name`, href: '#radio' },
        ])
        return res.redirect(`/prisoner/${prisonerNumber}/personal/change-name`)
      }

      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.EditNamePurpose,
          details: { purpose },
        })
        .catch(error => logger.error(error))

      const redirect = purpose === 'name-wrong' ? 'enter-corrected-name' : 'enter-new-name'
      return res.redirect(`/prisoner/${prisonerNumber}/personal/${redirect}`)
    }
  }

  public displayChangeNameCorrection(): RequestHandler {
    return this.displayChangeNamePage({
      pageTitle: `Enter this person’s correct name - Prisoner personal details`,
      formTitle: (titlePrisonerName: string) => `Enter ${apostrophe(titlePrisonerName)} correct name`,
      warningText: 'This will become their main name in DPS and NOMIS.',
      auditPage: Page.EditNameCorrection,
      prepopulateFields: true,
    })
  }

  public submitChangeNameCorrection(): RequestHandler {
    return this.submitChangeName({
      redirectUrl: 'enter-corrected-name',
      auditPostAction: PostAction.EditNameCorrection,
      submitMethod: this.aliasService.updateWorkingName.bind(this.aliasService),
    })
  }

  public displayChangeNameLegal(): RequestHandler {
    return this.displayChangeNamePage({
      pageTitle: `Enter this person’s new name - Prisoner personal details`,
      formTitle: (titlePrisonerName: string) => `Enter ${apostrophe(titlePrisonerName)} new name`,
      warningText: 'This will become their main name in DPS and NOMIS. The previous name will be recorded as an alias.',
      auditPage: Page.EditNameLegal,
      prepopulateFields: false,
    })
  }

  public submitChangeNameLegal(): RequestHandler {
    return this.submitChangeName({
      redirectUrl: 'enter-new-name',
      auditPostAction: PostAction.EditNameLegal,
      submitMethod: this.aliasService.createNewWorkingName.bind(this.aliasService),
    })
  }

  public displayAddNewAlias(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { clientToken, prisonerName, prisonerNumber, prisonId } = this.getCommonRequestData(req)
      const currentWorkingName = await this.aliasService.getWorkingNameAlias(clientToken, prisonerNumber)
      const errors = req.flash('errors')

      const formValues = requestBodyFromFlash<DateOfBirthForm | { sex: string }>(req) || {
        'dateOfBirth-year': currentWorkingName.dateOfBirth?.split('-')[0],
        'dateOfBirth-month': currentWorkingName.dateOfBirth?.split('-')[1],
        'dateOfBirth-day': currentWorkingName.dateOfBirth?.split('-')[2],
        sex: currentWorkingName.sex?.code,
      }

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.AddNewAlias,
        })
        .catch(error => logger.error(error))

      return res.render('pages/edit/alias/addNewAlias', {
        pageTitle: 'Enter alias details - Prisoner personal details',
        formTitle: 'Enter alias details',
        errors,
        formValues,
        miniBannerData: {
          prisonerNumber,
          prisonerName,
        },
      })
    }
  }

  public submitAddNewAlias(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber } = req.params
      const { clientToken } = req.middleware

      const formValues: PseudonymRequestDto = {
        firstName: req.body.firstName,
        middleName1: req.body.middleName1 || undefined,
        middleName2: req.body.middleName2 || undefined,
        lastName: req.body.lastName,
        dateOfBirth: dateToIsoDate(
          `${req.body['dateOfBirth-day']}/${req.body['dateOfBirth-month']}/${req.body['dateOfBirth-year']}`,
        ),
        sex: req.body.sex,
        isWorkingName: false,
      }

      const errors = req.errors || []
      if (errors.length) {
        req.flash('requestBody', JSON.stringify(req.body))
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/personal/enter-alias-details`)
      }

      try {
        const result = await this.aliasService.addNewAlias(
          clientToken,
          res.locals.user as PrisonUser,
          prisonerNumber,
          formValues,
        )

        req.flash('flashMessage', {
          text: 'Alias added',
          type: FlashMessageType.success,
          fieldName: 'aliases',
        })

        this.auditService
          .sendPostSuccess({
            user: res.locals.user,
            prisonerNumber,
            correlationId: req.id,
            action: PostAction.AddNewAlias,
            details: result,
          })
          .catch(error => logger.error(error))

        return res.redirect(`/prisoner/${prisonerNumber}/personal#personal-details`)
      } catch (e) {
        req.flash('errors', [{ text: 'There was an error please try again' }])
        req.flash('requestBody', JSON.stringify(req.body))
        return res.redirect(`/prisoner/${prisonerNumber}/personal/enter-alias-details`)
      }
    }
  }

  public displayChangeDateOfBirth(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { clientToken, prisonerName, prisonerNumber, prisonId } = this.getCommonRequestData(req)
      const currentWorkingName = await this.aliasService.getWorkingNameAlias(clientToken, prisonerNumber)
      const errors = req.flash('errors')

      const formValues = requestBodyFromFlash<DateOfBirthForm>(req) || {
        'dateOfBirth-year': currentWorkingName.dateOfBirth?.split('-')[0],
        'dateOfBirth-month': currentWorkingName.dateOfBirth?.split('-')[1],
        'dateOfBirth-day': currentWorkingName.dateOfBirth?.split('-')[2],
      }

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.EditDateOfBirth,
        })
        .catch(error => logger.error(error))

      return res.render('pages/edit/alias/changeDateOfBirth', {
        pageTitle: `Date of birth - Prisoner personal details`,
        warningText: 'This will become their date of birth in DPS and NOMIS.',
        errors,
        formValues,
        miniBannerData: {
          prisonerNumber,
          prisonerName,
        },
      })
    }
  }

  public submitChangeDateOfBirth(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber } = req.params
      const { clientToken } = req.middleware

      const dateOfBirth = dateToIsoDate(
        `${req.body['dateOfBirth-day']}/${req.body['dateOfBirth-month']}/${req.body['dateOfBirth-year']}`,
      )

      const errors = req.errors || []
      if (errors.length) {
        req.flash('requestBody', JSON.stringify(req.body))
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/personal/date-of-birth`)
      }

      try {
        const previousWorkingName = await this.aliasService.getWorkingNameAlias(clientToken, prisonerNumber)
        const result = await this.aliasService.updateDateOfBirth(
          clientToken,
          res.locals.user as PrisonUser,
          prisonerNumber,
          dateOfBirth,
        )

        req.flash('flashMessage', {
          text: 'Date of birth updated',
          type: FlashMessageType.success,
          fieldName: 'dateOfBirth',
        })

        this.auditService
          .sendPostSuccess({
            user: res.locals.user,
            prisonerNumber,
            correlationId: req.id,
            action: PostAction.EditDateOfBirth,
            details: {
              fieldName: 'dateOfBirth',
              previous: previousWorkingName.dateOfBirth,
              updated: result.dateOfBirth,
            },
          })
          .catch(error => logger.error(error))

        return res.redirect(`/prisoner/${prisonerNumber}/personal#personal-details`)
      } catch (e) {
        req.flash('errors', [{ text: 'There was an error please try again' }])
        req.flash('requestBody', JSON.stringify(req.body))
        return res.redirect(`/prisoner/${prisonerNumber}/personal/date-of-birth`)
      }
    }
  }

  public displayChangeEthnicGroup(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { clientToken, prisonerName, titlePrisonerName, prisonerNumber, prisonId } = this.getCommonRequestData(req)
      const errors = req.flash('errors')
      const [currentWorkingName, ethnicityReferenceDataCodes] = await Promise.all([
        this.aliasService.getWorkingNameAlias(clientToken, prisonerNumber),
        this.referenceDataService.getActiveReferenceDataCodes(
          CorePersonRecordReferenceDataDomain.ethnicity,
          clientToken,
        ),
      ])

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.EditEthnicGroup,
        })
        .catch(error => logger.error(error))

      return res.render('pages/edit/radioField', {
        pageTitle: `Ethnic group - Prisoner personal details`,
        formTitle: `What is ${apostrophe(titlePrisonerName)} ethnic group?`,
        hintText: `Choose the group which best describes this person’s ethnic group. You'll need to select a more detailed ethnic group on the next page.`,
        submitButtonText: 'Continue',
        options: getEthnicGroupRadioOptions(ethnicityReferenceDataCodes, currentWorkingName.ethnicity?.code),
        errors,
        prisonerNumber,
        breadcrumbPrisonerName: prisonerName,
        miniBannerData: {
          prisonerNumber,
          prisonerName,
        },
      })
    }
  }

  public submitChangeEthnicGroup(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { prisonerNumber } = this.getCommonRequestData(req)
      const { radioField: ethnicGroup } = req.body

      if (!ethnicGroup) {
        return res.redirect(`/prisoner/${prisonerNumber}/personal#personal-details`)
      }

      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.EditEthnicGroup,
          details: { ethnicGroup },
        })
        .catch(error => logger.error(error))

      if (ethnicGroup === 'NS') {
        req.params.group = 'NS'
        return this.submitChangeEthnicBackground()(req, res, next)
      }

      return res.redirect(`/prisoner/${prisonerNumber}/personal/${ethnicGroup}`)
    }
  }

  public displayChangeEthnicBackground(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { clientToken, prisonerName, titlePrisonerName, prisonerNumber, prisonId } = this.getCommonRequestData(req)
      const { group } = req.params
      const errors = req.flash('errors')

      const [currentWorkingName, ethnicityReferenceDataCodes] = await Promise.all([
        this.aliasService.getWorkingNameAlias(clientToken, prisonerNumber),
        this.referenceDataService.getActiveReferenceDataCodes(
          CorePersonRecordReferenceDataDomain.ethnicity,
          clientToken,
        ),
      ])

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.EditEthnicBackground,
        })
        .catch(error => logger.error(error))

      return res.render('pages/edit/radioField', {
        pageTitle: `${getEthnicGroupDescription(group)} - Prisoner personal details`,
        formTitle: `Which of the following best describes ${apostrophe(titlePrisonerName)} ${getEthnicGroupDescriptionForHeading(group)} background?`,
        backLink: `/prisoner/${prisonerNumber}/personal/ethnic-group`,
        options: getEthnicBackgroundRadioOptions(
          group,
          ethnicityReferenceDataCodes,
          currentWorkingName.ethnicity?.code,
        ),
        errors,
        prisonerNumber,
        breadcrumbPrisonerName: prisonerName,
        miniBannerData: {
          prisonerNumber,
          prisonerName,
        },
      })
    }
  }

  public submitChangeEthnicBackground(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { clientToken, prisonerNumber } = this.getCommonRequestData(req)
      const { group } = req.params
      const { radioField: ethnicBackground } = req.body

      if (!ethnicBackground) {
        req.flash('errors', [{ href: '#radio', text: `Select an ethnic group` }])
        return res.redirect(`/prisoner/${prisonerNumber}/personal/${group}`)
      }

      try {
        const previousWorkingName = await this.aliasService.getWorkingNameAlias(clientToken, prisonerNumber)
        const result = await this.aliasService.updateEthnicity(
          clientToken,
          res.locals.user as PrisonUser,
          prisonerNumber,
          ethnicBackground,
        )

        req.flash('flashMessage', {
          text: 'Ethnic group updated',
          type: FlashMessageType.success,
          fieldName: 'ethnicity',
        })

        this.auditService
          .sendPostSuccess({
            user: res.locals.user,
            prisonerNumber,
            correlationId: req.id,
            action: PostAction.EditEthnicBackground,
            details: {
              fieldName: 'ethnicity',
              previous: previousWorkingName.ethnicity?.code,
              updated: result.ethnicity?.code,
            },
          })
          .catch(error => logger.error(error))

        return res.redirect(`/prisoner/${prisonerNumber}/personal#personal-details`)
      } catch (e) {
        req.flash('errors', [{ text: 'There was an error please try again' }])
        req.flash('requestBody', JSON.stringify(req.body))
        return res.redirect(`/prisoner/${prisonerNumber}/personal/${group}`)
      }
    }
  }

  private displayChangeNamePage({
    pageTitle,
    formTitle,
    warningText,
    auditPage,
    prepopulateFields,
  }: {
    pageTitle: string
    formTitle: (titlePrisonerName: string) => string
    warningText: string
    auditPage: Page
    prepopulateFields: boolean
  }): RequestHandler {
    return async (req: Request, res: Response) => {
      const { clientToken, prisonerName, titlePrisonerName, prisonerNumber, prisonId } = this.getCommonRequestData(req)
      const { firstName, middleName1, middleName2, lastName } = await this.aliasService.getWorkingNameAlias(
        clientToken,
        prisonerNumber,
      )

      const errors = req.flash('errors')
      const formValues: Name = {
        ...(prepopulateFields
          ? {
              firstName: firstName && formatNamePart(firstName),
              middleName1: middleName1 && formatNamePart(middleName1),
              middleName2: middleName2 && formatNamePart(middleName2),
              lastName: lastName && formatNamePart(lastName),
            }
          : {}),
        ...requestBodyFromFlash<Name>(req),
      }

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: auditPage,
        })
        .catch(error => logger.error(error))

      return res.render('pages/edit/alias/changeName', {
        pageTitle,
        formTitle: formTitle(titlePrisonerName),
        warningText,
        errors,
        formValues,
        miniBannerData: {
          prisonerNumber,
          prisonerName,
        },
      })
    }
  }

  private submitChangeName({
    redirectUrl,
    auditPostAction,
    submitMethod,
  }: {
    redirectUrl: string
    auditPostAction: PostAction
    submitMethod: (
      clientToken: string,
      user: PrisonUser,
      prisonerNumber: string,
      name: Name,
    ) => Promise<PseudonymResponseDto>
  }): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber } = req.params
      const { clientToken } = req.middleware

      const formValues: Name = {
        firstName: req.body.firstName,
        middleName1: req.body.middleName1 || undefined,
        middleName2: req.body.middleName2 || undefined,
        lastName: req.body.lastName,
      }

      const errors = req.errors || []
      if (errors.length) {
        req.flash('requestBody', JSON.stringify(formValues))
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/personal/${redirectUrl}`)
      }

      try {
        const previousWorkingName = await this.aliasService.getWorkingNameAlias(clientToken, prisonerNumber)
        const result = await submitMethod(clientToken, res.locals.user as PrisonUser, prisonerNumber, formValues)

        req.flash('flashMessage', {
          text: 'Name updated',
          type: FlashMessageType.success,
          fieldName: 'fullName',
        })

        this.auditService
          .sendPostSuccess({
            user: res.locals.user,
            prisonerNumber,
            correlationId: req.id,
            action: auditPostAction,
            details: {
              fieldName: 'name',
              previous: {
                firstName: previousWorkingName.firstName,
                middleName1: previousWorkingName.middleName1,
                middleName2: previousWorkingName.middleName2,
                lastName: previousWorkingName.lastName,
              },
              updated: {
                firstName: result.firstName,
                middleName1: result.middleName1,
                middleName2: result.middleName2,
                lastName: result.lastName,
              },
            },
          })
          .catch(error => logger.error(error))

        return res.redirect(`/prisoner/${prisonerNumber}/personal#personal-details`)
      } catch (e) {
        req.flash('errors', [{ text: 'There was an error please try again' }])
        req.flash('requestBody', JSON.stringify(req.body))
        return res.redirect(`/prisoner/${prisonerNumber}/personal/${redirectUrl}`)
      }
    }
  }

  private getCommonRequestData(req: Request) {
    const { firstName, lastName, prisonerNumber, prisonId } = req.middleware.prisonerData
    const prisonerName = formatName(firstName, '', lastName, { style: NameFormatStyle.lastCommaFirst })
    const titlePrisonerName = formatName(firstName, '', lastName, { style: NameFormatStyle.firstLast })
    const { clientToken } = req.middleware
    return { prisonerNumber, prisonId, prisonerName, titlePrisonerName, clientToken }
  }
}
