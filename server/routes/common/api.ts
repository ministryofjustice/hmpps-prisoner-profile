import { Request, RequestHandler, Response } from 'express'
import OffenderService from '../../services/offenderService'
import { ApiAction, AuditService, SubjectType } from '../../services/auditService'
import logger from '../../../logger'
import PrisonPersonService from '../../services/prisonPersonService'

const placeHolderImage = '/assets/images/prisoner-profile-image.png'
const categoryAImage = '/assets/images/category-a-prisoner-image.png'

export default class CommonApiRoutes {
  public constructor(
    private readonly offenderService: OffenderService,
    private readonly auditService: AuditService,
    private readonly prisonPersonService: PrisonPersonService,
  ) {}

  public prisonerImage: RequestHandler = (req: Request, res: Response) => {
    const { prisonerNumber } = req.params
    const fullSizeImage = req.query.fullSizeImage ? req.query.fullSizeImage === 'true' : true

    this.auditService
      .sendEvent({
        who: res.locals.user.username,
        subjectId: prisonerNumber,
        correlationId: req.id,
        what: `API_${ApiAction.PrisonerImage}`,
        subjectType: SubjectType.PrisonerId,
      })
      .catch(error => logger.error(error))

    if (prisonerNumber === 'placeholder') {
      res.redirect(placeHolderImage)
    } else if (prisonerNumber === 'photoWithheld') {
      res.redirect(categoryAImage)
    } else {
      this.offenderService
        .getPrisonerImage(req.middleware.clientToken, prisonerNumber, fullSizeImage)
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

  public prisonPersonImage: RequestHandler = (req: Request, res: Response) => {
    const { imageId } = req.params

    this.prisonPersonService
      .getImage(req.middleware.clientToken, imageId)
      .then(({ stream, contentType }) => {
        res.set('Cache-control', 'private, max-age=86400')
        res.removeHeader('pragma')
        res.type(contentType || 'image/jpeg')
        stream.pipe(res)
      })
      .catch(_error => {
        res.redirect(placeHolderImage)
      })
  }
}
