import { Request, Response } from 'express'
import { AuditService, Page } from '../services/auditService'
import ProbationDocumentsService from '../services/probationDocumentsService'
import { formatName } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import config from '../config'

export default class ProbationDocumentsController {
  constructor(
    private readonly probationDocumentsService: ProbationDocumentsService,
    private readonly auditService: AuditService,
  ) {}

  public async displayDocuments(req: Request, res: Response) {
    const { firstName, lastName, prisonerNumber, prisonId } = req.middleware.prisonerData
    const [communityDocuments] = await Promise.all([
      this.probationDocumentsService.getDocuments(req.middleware.clientToken, prisonerNumber),
    ])

    this.auditService.sendPageView({
      correlationId: req.id,
      page: Page.ProbationDocuments,
      prisonerNumber,
      prisonId,
      userId: res.locals.user.username,
      userCaseLoads: res.locals.user.caseLoads,
      userRoles: res.locals.user.userRoles,
    })

    res.render('pages/probationDocuments/probationDocuments', {
      dpsUrl: config.serviceUrls.digitalPrison,
      prisonerNumber,
      prisonerBreadcrumbName: formatName(firstName, '', lastName, { style: NameFormatStyle.lastCommaFirst }),
      probationDocumentsNotFound: communityDocuments.notFound,
      ...communityDocuments.data,
    })
  }
}
