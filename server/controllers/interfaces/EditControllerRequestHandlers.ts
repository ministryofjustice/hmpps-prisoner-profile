import { RequestHandler } from 'express'

export interface EditControllerRequestHandlers {
  edit: RequestHandler
  submit: RequestHandler
}
