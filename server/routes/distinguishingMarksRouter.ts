import { Router } from 'express'
import { getRequest, postRequest } from './routerUtils'
import { formatName } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import DistinguishingMarksController from '../controllers/distinguishingMarksController'
import { Services } from '../services'

export default function distinguishingMarksRouter(services: Services): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)

  router.use((req, res, next) => {
    // set some prisoner data to use in the views
    const { firstName, lastName, prisonerNumber } = req.middleware.prisonerData
    const formattedData = {
      prisonerName: formatName(firstName, null, lastName, {
        style: NameFormatStyle.lastCommaFirst,
      }),
      prisonerNumber,
    }

    res.locals = { ...res.locals, ...formattedData }
    next()
  })

  const distinguishingMarksController = new DistinguishingMarksController(services.distinguishingMarksService)
  get('/add/:markType', distinguishingMarksController.newDistinguishingMark)
  post('/add/:markType', distinguishingMarksController.postNewDistinguishingMark)

  return router
}
