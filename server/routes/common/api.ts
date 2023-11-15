import { Request, RequestHandler, Response } from 'express'
import OffenderService from '../../services/offenderService'

const placeHolderImage = '/assets/images/prisoner-profile-image.png'
const categoryAImage = '/assets/images/category-a-prisoner-image.png'

export default class CommonApiRoutes {
  public constructor(private readonly offenderService: OffenderService) {}

  public prisonerImage: RequestHandler = (req: Request, res: Response) => {
    const { prisonerNumber } = req.params
    const fullSizeImage = req.query.fullSizeImage ? req.query.fullSizeImage === 'true' : true

    if (prisonerNumber === 'placeholder') {
      res.redirect(placeHolderImage)
    } else if (prisonerNumber === 'photoWithheld') {
      res.redirect(categoryAImage)
    } else {
      this.offenderService
        .getPrisonerImage(res.locals.user.token, prisonerNumber, fullSizeImage)
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

    if (imageId === 'placeholder') {
      res.sendFile(placeHolderImage)
    } else {
      this.offenderService
        .getImage(res.locals.user.token, imageId)
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
