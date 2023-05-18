import { Request, Response } from 'express'

export default (req: Request, res: Response) => {
  res.status(404)
  res.render('notFound.njk', { url: req.headers.referer || '/' })
}
