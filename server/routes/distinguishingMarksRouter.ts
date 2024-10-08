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
} from '../validators/personal/distinguishingMarksValidator'
import { allBodyParts } from '../controllers/interfaces/distinguishingMarks/selectionTypes'
import { requestBodyFromFlash } from '../utils/requestBodyFromFlash'

export default function distinguishingMarksRouter(services: Services): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)

  router.use((req, res, next) => {
    // set some prisoner data to use in the views
    const { firstName, lastName, prisonerNumber } = req.middleware.prisonerData
    res.locals = {
      ...res.locals,
      prisonerName: formatName(firstName, null, lastName, { style: NameFormatStyle.lastCommaFirst }),
      prisonerNumber,
    }
    next()
  })

  router.get('*', (req, res, next) => {
    res.locals = { ...res.locals, errors: req.flash('errors'), formValues: requestBodyFromFlash(req) }
    next()
  })

  const distinguishingMarksController = new DistinguishingMarksController(services.distinguishingMarksService)

  get('/add/:markType', distinguishingMarksController.newDistinguishingMark)
  post(
    '/add/:markType',
    validationMiddleware([newDistinguishingMarkValidator], {
      redirectBackOnError: true,
      redirectTo: 'personal/edit/distinguishing-mark/add/mark',
    }),
    distinguishingMarksController.postNewDistinguishingMark,
  )
  get('/add/:markType/:bodyPart', distinguishingMarksController.newDistinguishingMarkWithDetail)

  post(
    '/add/:markType/:bodyPart',
    multer().fields(allBodyParts.map(part => ({ name: `file-${part}`, maxCount: 1 }))),
    (req, res, next) => {
      const { bodyPart, markType } = req.params
      validationMiddleware([newDetailedDistinguishingMarkValidator], {
        redirectBackOnError: true,
        redirectTo: `personal/edit/distinguishing-mark/add/${markType}/${bodyPart}`,
      })(req, res, next)
    },
    distinguishingMarksController.postNewDistinguishingMarkWithDetail,
  )

  return router
}
