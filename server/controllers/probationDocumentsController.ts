import type { Request, Response } from 'express'
import logger from '../../logger'
import type { AuditService } from '../services/interfaces/auditService'
import { Page } from '../services/interfaces/auditService/page'
import ProbationDocumentsService from '../services/probationDocumentsService'
import config from '../config'

export default class ProbationDocumentsController {
  constructor(
    readonly probationDocumentsService: ProbationDocumentsService,
    private readonly auditService: AuditService,
  ) {}

  public async displayDocuments(req: Request, res: Response) {
    const { prisonerNumber, prisonId } = req.middleware.prisonerData

    const probationDocuments = await this.probationDocumentsService.getDocuments(
      req.middleware.clientToken,
      prisonerNumber,
    )

    this.auditService
      .sendPageView({
        user: res.locals.user,
        correlationId: req.id,
        page: Page.ProbationDocuments,
        prisonerNumber,
        prisonId,
        justification: req.session.justifiedHighProfilePrisonerAccess?.[prisonerNumber] ?? null,
      })
      .catch(error => logger.error(error))

    res.render('pages/probationDocuments/probationDocuments', {
      pageTitle: 'Probation documents',
      dpsUrl: config.serviceUrls.digitalPrison,
      probationDocuments,
    })
  }
}
