import { Request, Response } from 'express'
import { formatName, sortArrayOfObjectsByDate, SortType } from '../utils/utils'
import { AuditService, Page } from '../services/auditService'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import logger from '../../logger'
import CareNeedsService from '../services/careNeedsService'

export default class CareNeedsController {
  constructor(
    private readonly careNeedsService: CareNeedsService,
    private readonly auditService: AuditService,
  ) {}

  public async displayPastCareNeeds(req: Request, res: Response) {
    const { firstName, lastName, prisonerNumber, bookingId, prisonId } = req.middleware.prisonerData
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
      prisonerNumber,
      breadcrumbPrisonerName: formatName(firstName, '', lastName, { style: NameFormatStyle.lastCommaFirst }),
      prisonerName: formatName(firstName, '', lastName),
    })
  }

  public async displayXrayBodyScans(req: Request, res: Response) {
    const { prisonerData, clientToken } = req.middleware
    const { firstName, lastName, prisonerNumber, bookingId } = prisonerData

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
      prisonerNumber,
      breadcrumbPrisonerName: formatName(firstName, '', lastName, { style: NameFormatStyle.lastCommaFirst }),
      prisonerName: formatName(firstName, '', lastName),
      bodyScans: sortArrayOfObjectsByDate(bodyScans, 'scanDate', SortType.DESC),
    })
  }
}
