import { Request, RequestHandler, Response } from 'express'
import { apostrophe, formatName } from '../utils/utils'
import { AuditService, Page, PostAction } from '../services/auditService'
import logger from '../../logger'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'

export default class AliasController {
  constructor(private readonly auditService: AuditService) {}

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

  private getCommonRequestData(req: Request) {
    const { firstName, lastName, prisonerNumber, prisonId } = req.middleware.prisonerData
    const prisonerName = formatName(firstName, '', lastName, { style: NameFormatStyle.lastCommaFirst })
    const titlePrisonerName = formatName(firstName, '', lastName, { style: NameFormatStyle.firstLast })
    const { clientToken } = req.middleware
    return { prisonerNumber, prisonId, prisonerName, titlePrisonerName, clientToken }
  }
}
