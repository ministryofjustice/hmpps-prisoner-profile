import type { NextFunction, Request, Response } from 'express'
import type { PermissionsService } from '@ministryofjustice/hmpps-prison-permissions-lib'
import type { HmppsUser } from '@ministryofjustice/hmpps-prison-permissions-lib/dist/types/internal/user/HmppsUser'
import logger from '../../logger'
import type { AuditService } from '../services/interfaces/auditService'
import { Page } from '../services/interfaces/auditService/page'
import getCommonRequestData from '../utils/getCommonRequestData'
import NotFoundError from '../utils/notFoundError'

export default class DuplicateProfilesController {
  constructor(
    private readonly permissionsService: PermissionsService,
    private readonly auditService: AuditService,
  ) {}

  public async getDuplicateProfiles(req: Request, res: Response, next: NextFunction) {
    const { prisonerData, duplicatePrisonerData } = req.middleware
    const { prisonerNumber, prisonId } = prisonerData
    const { miniBannerData } = getCommonRequestData(req, res)

    if (!duplicatePrisonerData?.length && !res.locals.duplicateRecordApiFailure) {
      return next(new NotFoundError())
    }

    const prisonerPermissionsMap = Object.fromEntries(
      duplicatePrisonerData.map(duplicate => {
        return [
          duplicate.prisonerNumber,
          this.permissionsService.getPrisonerPermissions({
            user: res.locals.user as unknown as HmppsUser,
            prisoner: duplicate,
            duplicateRecords: [
              prisonerData,
              ...duplicatePrisonerData.filter(other => other.prisonerNumber !== duplicate.prisonerNumber),
            ],
            requestDependentOn: [],
          }),
        ]
      }),
    )

    this.auditService
      .sendPageView({
        user: res.locals.user,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: Page.PossibleDuplicateProfiles,
        justification: req.session.justifiedHighProfilePrisonerAccess?.[prisonerNumber] ?? null,
      })
      .catch(error => logger.error(error))

    return res.render('pages/duplicateProfiles', {
      pageTitle: 'Possible duplicate profiles for this person',
      miniBannerData,
      duplicateProfiles: duplicatePrisonerData,
      prisonerPermissionsMap,
      backLinkUrl: `/prisoner/${prisonerData.prisonerNumber}`,
      useCustomErrorBanner: true,
    })
  }
}
