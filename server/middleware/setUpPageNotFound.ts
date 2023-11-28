import { Request, Response } from 'express'

export default (req: Request, res: Response) => {
  res.status(404)
  res.locals = {
    ...res.locals,
    hideBackLink: true,
  }
  res.render('notFound', { url: req.headers.referer || '/' })
}
