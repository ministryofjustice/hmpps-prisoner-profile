import { Request, Response } from 'express'

export default (req: Request, res: Response) => {
  res.status(404)
  res.locals = {
    ...res.locals,
    user: {
      ...res.locals.user,
      showFeedbackBanner: false,
    },
    hideBackLink: true,
  }
  res.render('notFound', { url: req.headers.referer || '/' })
}
