import { Request, Response } from 'express'
import { sortArrayOfObjectsByDate, SortType } from '../utils/utils'
import { AuditService, Page } from '../services/auditService'
import logger from '../../logger'
import CareNeedsService from '../services/careNeedsService'

export default class CareNeedsController {
  constructor(
    readonly careNeedsService: CareNeedsService,
    private readonly auditService: AuditService,
  ) {}

  public async displayPastCareNeeds(req: Request, res: Response) {
    const { prisonerNumber, bookingId, prisonId } = req.middleware.prisonerData
    const { clientToken } = req.middleware

    const careNeeds = await this.careNeedsService.getCareNeedsAndAdjustments(clientToken, bookingId)

    this.auditService
      .sendPageView({
        user: res.locals.user,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: Page.PastCareNeeds,
      })
      .catch(error => logger.error(error))

    return res.render('pages/careNeeds/pastCareNeeds', {
      pageTitle: 'Past care needs',
      careNeeds: careNeeds
        .filter(need => !need.isOngoing)
        .sort((a, b) => b.endDate?.localeCompare(a.endDate) || b.startDate?.localeCompare(a.startDate)),
    })
  }

  public async displayXrayBodyScans(req: Request, res: Response) {
    const { prisonerData, clientToken } = req.middleware
    const { bookingId } = prisonerData

    const bodyScans = await this.careNeedsService.getXrayBodyScans(clientToken, bookingId)

    await this.auditService.sendPageView({
      user: res.locals.user,
      prisonerNumber: prisonerData.prisonerNumber,
      prisonId: prisonerData.prisonId,
      correlationId: req.id,
      page: Page.XRayBodyScans,
    })

    res.render('pages/xrayBodyScans', {
      pageTitle: 'X-ray body scans',
      bodyScans: sortArrayOfObjectsByDate(bodyScans, 'scanDate', SortType.DESC),
    })
  }
}
