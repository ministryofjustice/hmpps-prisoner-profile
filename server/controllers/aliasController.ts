import { Request, RequestHandler, Response } from 'express'
import { apostrophe, formatName } from '../utils/utils'
import { AuditService, Page, PostAction } from '../services/auditService'
import logger from '../../logger'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { FlashMessageType } from '../data/enums/flashMessageType'
import AliasService, { Name } from '../services/aliasService'
import { requestBodyFromFlash } from '../utils/requestBodyFromFlash'
import { PrisonUser } from '../interfaces/HmppsUser'
import {
  PseudonymRequestDto,
  PseudonymResponseDto,
} from '../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { dateToIsoDate } from '../utils/dateHelpers'

export default class AliasController {
  constructor(
    private readonly aliasService: AliasService,
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

      return res.render('pages/edit/alias/changeNamePurpose', {
        pageTitle: `Why are you changing this person's name? - Prisoner personal details`,
        formTitle: `Why are you changing ${apostrophe(titlePrisonerName)} name?`,
        errors,
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
      const { purpose } = req.body

      if (!purpose) {
        req.flash('errors', [{ text: `Select why you're changing ${apostrophe(titlePrisonerName)} name` }])
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
      const { prisonerName, prisonerNumber, prisonId } = this.getCommonRequestData(req)
      const currentWorkingName = await this.aliasService.getWorkingNameAlias(req.middleware.clientToken, prisonerNumber)
      const errors = req.flash('errors')

      const formValues = requestBodyFromFlash<Name>(req) || {
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

  private displayChangeNamePage({
    pageTitle,
    formTitle,
    warningText,
    auditPage,
  }: {
    pageTitle: string
    formTitle: (titlePrisonerName: string) => string
    warningText: string
    auditPage: Page
  }): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerName, titlePrisonerName, prisonerNumber, prisonId } = this.getCommonRequestData(req)
      const errors = req.flash('errors')

      const formValues = requestBodyFromFlash<Name>(req) || {}

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
          fieldName: 'full-name',
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
