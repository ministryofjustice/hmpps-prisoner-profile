import type { Request, Response } from 'express'
import config from '../config'
import logger from '../../logger'
import { type AuditService, Page } from '../services/auditService'
import type CareNeedsService from '../services/careNeedsService'
import type { RestClientBuilder } from '../data'
import { Role } from '../data/enums/role'
import type { XRayBodyScansApiClient } from '../data/interfaces/xRayBodyScansApi'
import { PrisonUser } from '../interfaces/HmppsUser'

export default class CareNeedsController {
  constructor(
    readonly careNeedsService: CareNeedsService,
    private readonly xRayBodyScansApiClientBuilder: RestClientBuilder<XRayBodyScansApiClient>,
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
    const { user } = res.locals
    const { userRoles } = user as PrisonUser

    // TODO: make this obey service’s active agencies
    const showUnsafeXRayBodyScanData =
      config.featureToggles.xRayBodyScansEnabled && userRoles.includes(Role.DpsApplicationDeveloper)

    if (showUnsafeXRayBodyScanData) {
      // TODO: move redirect to router level once enabled everywhere
      res.redirect(`${config.serviceUrls.xRayBodyScansUi}/prisoner/${prisonerData.prisonerNumber}/scan-overview`)
      return
    }

    const xRayBodyScansApiClient = this.xRayBodyScansApiClientBuilder(clientToken)
    const pageOfScans = await xRayBodyScansApiClient.listScans(prisonerData.prisonerNumber, { size: 200 })
    const showingDpsAndNomisScans =
      config.featureToggles.xRayBodyScansEnabled &&
      pageOfScans.content.some(scan => scan.source === 'DPS') &&
      pageOfScans.content.some(scan => scan.source === 'NOMIS')

    await this.auditService.sendPageView({
      user: res.locals.user,
      prisonerNumber: prisonerData.prisonerNumber,
      prisonId: prisonerData.prisonId,
      correlationId: req.id,
      page: Page.XRayBodyScans,
    })

    res.render('pages/xrayBodyScans', {
      pageTitle: 'X-ray body scans',
      pageOfScans,
      showingDpsAndNomisScans,
    })
  }
}
