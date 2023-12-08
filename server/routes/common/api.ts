import { Request, RequestHandler, Response } from 'express'
import OffenderService from '../../services/offenderService'
import { ApiAction, AuditService, SubjectType } from '../../services/auditService'

const placeHolderImage = '/assets/images/prisoner-profile-image.png'
const categoryAImage = '/assets/images/category-a-prisoner-image.png'

export default class CommonApiRoutes {
  public constructor(
    private readonly offenderService: OffenderService,
    private readonly auditService: AuditService,
  ) {}

  public prisonerImage: RequestHandler = (req: Request, res: Response) => {
    const { prisonerNumber } = req.params
    const fullSizeImage = req.query.fullSizeImage ? req.query.fullSizeImage === 'true' : true

    this.auditService.sendEvent({
      who: res.locals.user.username,
      subjectId: prisonerNumber,
      correlationId: req.id,
      what: `API_${ApiAction.PrisonerImage}`,
      subjectType: SubjectType.PrisonerId,
    })

    if (prisonerNumber === 'placeholder') {
      res.redirect(placeHolderImage)
    } else if (prisonerNumber === 'photoWithheld') {
      res.redirect(categoryAImage)
    } else {
      this.offenderService
        .getPrisonerImage(res.locals.clientToken, prisonerNumber, fullSizeImage)
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

    this.auditService.sendEvent({
      who: res.locals.user.username,
      subjectId: imageId,
      correlationId: req.id,
      what: `API_${ApiAction.Image}`,
    })

    if (imageId === 'placeholder') {
      res.sendFile(placeHolderImage)
    } else {
      this.offenderService
        .getImage(res.locals.clientToken, imageId)
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
}
