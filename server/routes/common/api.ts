import { Request, RequestHandler, Response } from 'express'
import path from 'path'
import OffenderService from '../../services/offenderService'

const placeHolderImage = path.join(process.cwd(), '/assets/images/prisoner-profile-image.png')
const categoryAImage = path.join(process.cwd(), '/assets/images/category-a-prisoner-image.png')

export default class CommonApiRoutes {
  public prisonerImage: RequestHandler = (req: Request, res: Response) => {
    const { prisonerNumber } = req.params
    const offenderService = new OffenderService()

    if (prisonerNumber === 'placeholder') {
      res.sendFile(placeHolderImage)
    } else if (prisonerNumber === 'photoWithheld') {
      res.sendFile(categoryAImage)
    } else {
      offenderService
        .getPrisonerImage(res.locals.user.token, prisonerNumber)
        .then(data => {
          res.type('image/jpeg')
          data.pipe(res)
        })
        .catch(_error => {
          res.sendFile(placeHolderImage)
        })
    }
  }

  public image: RequestHandler = (req: Request, res: Response) => {
    const { imageId } = req.params
    const offenderService = new OffenderService()

    if (imageId === 'placeholder') {
      res.sendFile(placeHolderImage)
    } else {
      offenderService
        .getImage(res.locals.user.token, imageId)
        .then(data => {
          res.type('image/jpeg')
          data.pipe(res)
        })
        .catch(_error => {
          res.sendFile(placeHolderImage)
        })
    }
  }
}
