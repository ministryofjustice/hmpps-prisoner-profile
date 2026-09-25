import type { Request, Response } from 'express'
import { isGranted, XRayBodyScansPermission } from '@ministryofjustice/hmpps-prison-permissions-lib'
import config from '../config'
import type { PrisonUser } from '../interfaces/HmppsUser'
import { isServiceEnabled } from '../utils/isServiceEnabled'
import type PrisonService from './prisonService'

/** Whether the x-ray body scans service is available in the active case load */
export enum XRayBodyScansAvailability {
  /** The service can be accessed now */
  AVAILABLE = 'AVAILABLE',
  /** The service will become available after rollout (but some features already visible) */
  AVAILABLE_SOON = 'AVAILABLE_SOON',
  /** The service cannot be accessed */
  UNAVAILABLE = 'UNAVAILABLE',
}

export class XRayBodyScansAvailabilityService {
  constructor(private readonly prisonService: PrisonService) {}

  async getAvailability(req: Request, res: Response): Promise<XRayBodyScansAvailability> {
    const { clientToken } = req.middleware
    const { prisonerPermissions, user } = res.locals
    const { activeCaseLoadId } = user as PrisonUser

    if (!config.featureToggles.xRayBodyScansEnabled) {
      // rollout has not commenced
      return XRayBodyScansAvailability.UNAVAILABLE
    }

    if (!isGranted(XRayBodyScansPermission.read_scans, prisonerPermissions)) {
      // permissions disallow access (likely due to prisoner’s location)
      // NB: read scans is a stricter check than the base check (edit scans currently matches)
      return XRayBodyScansAvailability.UNAVAILABLE
    }

    if (isServiceEnabled('x-ray-body-scans', res.locals.feComponents?.sharedData)) {
      // rolled out in the user’s prison / active case load
      return XRayBodyScansAvailability.AVAILABLE
    }

    const prison = await this.prisonService.getCompletePrisonDetailsByPrisonId(activeCaseLoadId, clientToken)
    if (!prison || prison.female || prison.types.some(type => type.code === 'YCS')) {
      // will not be rolled out in female or youth custody service estates
      return XRayBodyScansAvailability.UNAVAILABLE
    }

    // not rolled out yet (prison group not excluded but also not active agency)
    return XRayBodyScansAvailability.AVAILABLE_SOON
  }
}
