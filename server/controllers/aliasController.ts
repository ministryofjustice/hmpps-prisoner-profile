import { Request, RequestHandler, Response } from 'express'
import { apostrophe, formatName, formatNamePart } from '../utils/utils'
import { AuditService, Page, PostAction } from '../services/auditService'
import logger from '../../logger'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { FlashMessageType } from '../data/enums/flashMessageType'
import AliasService, { Name } from '../services/aliasService'
import { requestBodyFromFlash } from '../utils/requestBodyFromFlash'
import { PrisonUser } from '../interfaces/HmppsUser'

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
    return async (req: Request, res: Response) => {
      const { prisonerName, titlePrisonerName, prisonerNumber, prisonId } = this.getCommonRequestData(req)
      const { firstName, middleName1, middleName2, lastName } = await this.aliasService.getWorkingNameAlias(
        req.middleware.clientToken,
        prisonerNumber,
      )
      const errors = req.flash('errors')

      const formValues = requestBodyFromFlash<Name>(req) || {
        firstName: formatNamePart(firstName),
        middleName1: formatNamePart(middleName1),
        middleName2: formatNamePart(middleName2),
        lastName: formatNamePart(lastName),
      }

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.EditNameCorrection,
        })
        .catch(error => logger.error(error))

      return res.render('pages/edit/alias/changeNameCorrection', {
        pageTitle: `Enter this person's correct name - Prisoner personal details`,
        formTitle: `Enter ${apostrophe(titlePrisonerName)} correct name`,
        errors,
        formValues,
        miniBannerData: {
          prisonerNumber,
          prisonerName,
        },
      })
    }
  }

  public submitChangeNameCorrection(): RequestHandler {
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
        return res.redirect(`/prisoner/${prisonerNumber}/personal/enter-corrected-name`)
      }

      try {
        const previousWorkingName = await this.aliasService.getWorkingNameAlias(clientToken, prisonerNumber)
        const result = await this.aliasService.updateWorkingName(
          clientToken,
          res.locals.user as PrisonUser,
          prisonerNumber,
          formValues,
        )

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
            action: PostAction.EditNameCorrection,
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
        return res.redirect(`/prisoner/${prisonerNumber}/personal/enter-corrected-name`)
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
