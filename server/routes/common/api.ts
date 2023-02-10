import { Request, RequestHandler, Response } from 'express'
import path from 'path'
import { Readable } from 'stream'
import OffenderService from '../../services/offenderService'

const placeHolderImage = path.join(process.cwd(), '/assets/images/prisoner-profile-photo.png')

export default class CommonApiRoutes {
  public prisonerImage: RequestHandler = (req: Request, res: Response) => {
    const { prisonerNumber } = req.params
    const offenderService = new OffenderService()
    if (prisonerNumber !== 'placeholder') {
      offenderService
        .getPrisonerImage<Readable>(res.locals.user.token, prisonerNumber)
        .then(data => {
          res.type('image/jpeg')
          data.pipe(res)
        })
        .catch(_error => {
          res.sendFile(placeHolderImage)
        })
    } else {
      res.sendFile(placeHolderImage)
    }
  }
}
