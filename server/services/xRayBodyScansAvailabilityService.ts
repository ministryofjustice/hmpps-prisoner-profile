import type { Request, Response } from 'express'
import { isGranted, XRayBodyScansPermission } from '@ministryofjustice/hmpps-prison-permissions-lib'
import type { PrisonUser } from '../interfaces/HmppsUser'
import { isServiceEnabled } from '../utils/isServiceEnabled'
import type PrisonService from './prisonService'

/** Whether the x-ray body scans service is available in the active case load */
export enum XRayBodyScansAvailability {
  /** The service can be accessed now */
  AVAILABLE = 'AVAILABLE',
  /** The service will become available after rollout (but some features already visible) */
  AVAILABLE_SOON = 'AVAILABLE_SOON',
  /** The service cannot be accessed due to failing permission checks */
  UNAUTHORISED = 'UNAUTHORISED',
  /** The service cannot be accessed */
  UNAVAILABLE = 'UNAVAILABLE',
}

export class XRayBodyScansAvailabilityService {
  constructor(private readonly prisonService: PrisonService) {}

  /**
   * The overview card is only hidden when
   * 1) rollout has not started or
   * 2) the active case load is an excluded prison group
   * …but the action links only point to the new service if it is fully available to the user
   */
  showOverviewCard(availability: XRayBodyScansAvailability): boolean {
    return availability !== XRayBodyScansAvailability.UNAVAILABLE
  }

  async getAvailability(req: Request, res: Response): Promise<XRayBodyScansAvailability> {
    const { clientToken } = req.middleware
    const { prisonerPermissions, user } = res.locals
    const { activeCaseLoadId } = user as PrisonUser

    // permissions may disallow access (likely due to prisoner’s location)
    // NB: read scans is a stricter check than the base check (read and edit scans checks currently match)
    const permissionDenied = !isGranted(XRayBodyScansPermission.read_scans, prisonerPermissions)

    if (isServiceEnabled('x-ray-body-scans', res.locals.feComponents?.sharedData)) {
      // rolled out in the user’s prison / active case load
      if (permissionDenied) {
        return XRayBodyScansAvailability.UNAUTHORISED
      }
      return XRayBodyScansAvailability.AVAILABLE
    }

    const prison = await this.prisonService.getCompletePrisonDetailsByPrisonId(activeCaseLoadId, clientToken)
    if (!prison || prison.female || prison.types.some(type => type.code === 'YCS')) {
      // will not be rolled out in female or youth custody service estates
      return XRayBodyScansAvailability.UNAVAILABLE
    }

    // not rolled out yet (prison group not excluded but also not active agency)
    if (permissionDenied) {
      return XRayBodyScansAvailability.UNAUTHORISED
    }
    return XRayBodyScansAvailability.AVAILABLE_SOON
  }
}
