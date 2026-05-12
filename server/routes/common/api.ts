import { Request, RequestHandler, Response } from 'express'
import { CorePersonRecordPermission, isGranted } from '@ministryofjustice/hmpps-prison-permissions-lib'
import OffenderService from '../../services/offenderService'
import { ApiAction, AuditService, SubjectType } from '../../services/auditService'
import logger from '../../../logger'
import PhotoService from '../../services/photoService'
import DistinguishingMarksService from '../../services/distinguishingMarksService'
import MetricsService from '../../services/metrics/metricsService'
import { PrisonUser } from '../../interfaces/HmppsUser'

const placeHolderImage = '/assets/images/prisoner-profile-image.png'

// This is unused but kept for the path for now
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const categoryAImage = '/assets/images/category-a-prisoner-image.jpg'

export default class CommonApiRoutes {
  public constructor(
    private readonly offenderService: OffenderService,
    private readonly auditService: AuditService,
    private readonly distinguishingMarksService: DistinguishingMarksService,
    private readonly photoService: PhotoService,
    private readonly metricsService: MetricsService,
  ) {}

  private async streamFacialImage(imageId: string, fullSizeImage: boolean, req: Request, res: Response) {
    try {
      const data = await this.offenderService.getImage(req.middleware.clientToken, imageId, fullSizeImage)
      res.set('Cache-control', 'private, max-age=86400')
      res.removeHeader('pragma')
      res.type('image/jpeg')
      data.pipe(res)
    } catch {
      res.redirect(placeHolderImage)
    }
  }

  public prisonerImage: RequestHandler = (req: Request, res: Response) => {
    const { prisonerNumber } = req.params
    const fullSizeImage = req.query.fullSizeImage ? req.query.fullSizeImage === 'true' : true
    const { prisonerData } = req.middleware
    const { prisonerPermissions } = res.locals
    const imageIdQuery = (req.query.imageId as string) || undefined
    const currentFacialImageId = prisonerData.currentFacialImageId || undefined

    this.auditService
      .sendEvent({
        who: res.locals.user.username,
        subjectId: prisonerNumber,
        correlationId: req.id,
        what: `API_${ApiAction.PrisonerImage}`,
        subjectType: SubjectType.PrisonerId,
      })
      .catch(error => logger.error(error))

    const imageQueryMatchesCurrent = imageIdQuery && currentFacialImageId && +imageIdQuery === currentFacialImageId
    const hasPermission = isGranted(CorePersonRecordPermission.read_photo, prisonerPermissions)

    if (hasPermission && imageQueryMatchesCurrent) {
      this.streamFacialImage(imageIdQuery, fullSizeImage, req, res)
    }

    if (hasPermission && !imageQueryMatchesCurrent) {
      this.photoService.getNewestActiveFacialImageId(prisonerNumber, req.middleware.clientToken).then(imageId => {
        if (imageId) {
          this.streamFacialImage(imageId.toString(), fullSizeImage, req, res)
        } else {
          res.redirect(placeHolderImage)
        }
      })
    }

    if (!hasPermission) {
      res.redirect(placeHolderImage)
    }
  }

  public image: RequestHandler = (req: Request, res: Response) => {
    const { imageId } = req.params

    this.auditService
      .sendEvent({
        who: res.locals.user.username,
        subjectId: imageId,
        correlationId: req.id,
        what: `API_${ApiAction.Image}`,
      })
      .catch(error => logger.error(error))

    if (imageId === 'placeholder') {
      res.sendFile(placeHolderImage)
    } else {
      this.offenderService
        .getImage(req.middleware.clientToken, imageId)
        .then(data => {
          res.set('Cache-control', 'private, max-age=86400')
          res.removeHeader('pragma')
          res.type('image/jpeg')
          data.pipe(res)
        })
        .catch(_error => {
          res.redirect(placeHolderImage)
        })
    }
  }

  public distinguishingMarkImage: RequestHandler = (req: Request, res: Response) => {
    const { imageId } = req.params

    this.distinguishingMarksService
      .getImage(req.middleware.clientToken, imageId)
      .then(data => {
        res.set('Cache-control', 'private, max-age=86400')
        res.removeHeader('pragma')
        res.type('image/jpeg')
        data.pipe(res)
      })
      .catch(_error => {
        res.redirect(placeHolderImage)
      })
  }

  public errorReporting: RequestHandler = (req, res) => {
    const { prisonerNumber } = req.params
    const user = res.locals.user as PrisonUser

    this.metricsService.trackFrontendError(
      prisonerNumber,
      req.query?.pageUrl as string,
      req.query?.error as string,
      user,
    )

    res.send('ok')
  }
}
