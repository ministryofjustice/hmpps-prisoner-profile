import { Request, Response } from 'express'

/**
 * Parse requests for money routes and orchestrate response
 */
export default class SpikeController {
  constructor() {}

  public async showPage(req: Request, res: Response) {
    return res.render('pages/spike/multiFileUpload', {})
  }

  public async handleUpload(req: Request, res: Response) {
    console.log('Handling the upload')
    return res.redirect(`/prisoner/spike`)
  }
}
