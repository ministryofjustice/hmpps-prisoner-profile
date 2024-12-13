import { Router } from 'express'
import multer from 'multer'
import { getRequest, postRequest } from './routerUtils'
import { formatName } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import DistinguishingMarksController from '../controllers/distinguishingMarksController'
import { Services } from '../services'
import validationMiddleware from '../middleware/validationMiddleware'
import {
  newDetailedDistinguishingMarkValidator,
  newDistinguishingMarkValidator,
  updateLocationValidator,
} from '../validators/personal/distinguishingMarksValidator'
import { allBodyParts } from '../controllers/interfaces/distinguishingMarks/selectionTypes'
import { requestBodyFromFlash } from '../utils/requestBodyFromFlash'

export default function distinguishingMarksRouter(services: Services): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)

  // Define valid body parts
  const validBodyParts =
    'face|front-and-sides|right-arm|right-leg|right-hand|right-foot|left-arm|left-leg|left-hand|left-foot|back|neck'

  router.use((req, res, next) => {
    // set some prisoner data to use in the views
    const { firstName, lastName, prisonerNumber } = req.middleware.prisonerData
    res.locals = {
      ...res.locals,
      prisonerName: formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst }),
      prisonerNumber,
    }
    return next()
  })

  router.get('*', (req, res, next) => {
    res.locals = { ...res.locals, errors: req.flash('errors'), formValues: requestBodyFromFlash(req) }
    next()
  })

  const distinguishingMarksController = new DistinguishingMarksController(services.distinguishingMarksService)

  // Add distinguishing mark
  get('/', distinguishingMarksController.newDistinguishingMark)
  post(
    '/',
    validationMiddleware([newDistinguishingMarkValidator], {
      redirectBackOnError: true,
    }),
    distinguishingMarksController.postNewDistinguishingMark,
  )

  // Add distinguishing mark with detail
  get(`/:bodyPart(${validBodyParts})`, distinguishingMarksController.newDistinguishingMarkWithDetail)
  post(
    `/:bodyPart(${validBodyParts})`,
    multer().fields(allBodyParts.map(part => ({ name: `file-${part}`, maxCount: 1 }))),
    validationMiddleware([newDetailedDistinguishingMarkValidator], {
      redirectBackOnError: true,
    }),
    distinguishingMarksController.postNewDistinguishingMarkWithDetail,
  )

  // Edit distinguishing mark
  get('/:markId', distinguishingMarksController.changeDistinguishingMark)

  // Change body part
  get('/:markId/body-part', distinguishingMarksController.changeBodyPart)
  post(
    '/:markId/body-part',
    validationMiddleware([newDistinguishingMarkValidator], {
      redirectBackOnError: true,
    }),
    distinguishingMarksController.updateBodyPart,
  )

  // Change location
  get('/:markId/location', distinguishingMarksController.changeLocation)
  post(
    '/:markId/location',
    validationMiddleware([updateLocationValidator], {
      redirectBackOnError: true,
    }),
    distinguishingMarksController.updateLocation,
  )

  return router
}
