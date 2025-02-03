import { Router } from 'express'
import SpikeController from '../controllers/spikeController'
import { getRequest, postRequest } from './routerUtils'

export default function spikeRouter(): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)

  const spikeController = new SpikeController()

  get('/prisoner/spike', spikeController.showPage)

  post('/prisoner/spike', spikeController.handleUpload)

  return router
}
