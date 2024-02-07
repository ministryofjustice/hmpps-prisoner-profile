import { Request, Response } from 'express'
import { formatName } from '../utils/utils'
import { AuditService, Page } from '../services/auditService'
import BeliefService from '../services/beliefService'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import logger from '../../logger'

export default class BeliefHistoryController {
  constructor(
    private readonly beliefService: BeliefService,
    private readonly auditService: AuditService,
  ) {}

  public async displayBeliefHistory(req: Request, res: Response) {
    const { firstName, lastName, prisonerNumber, bookingId, prisonId } = req.middleware.prisonerData
    const { clientToken } = res.locals

    const beliefs = await this.beliefService.getBeliefHistory(clientToken, prisonerNumber, bookingId)

    this.auditService
      .sendPageView({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: Page.ReligionBeliefHistory,
      })
      .catch(error => logger.error(error))

    return res.render('pages/beliefHistory', {
      pageTitle: 'Religion or belief history',
      beliefs,
      prisonerNumber,
      breadcrumbPrisonerName: formatName(firstName, '', lastName, { style: NameFormatStyle.lastCommaFirst }),
      prisonerName: formatName(firstName, '', lastName),
    })
  }
}
