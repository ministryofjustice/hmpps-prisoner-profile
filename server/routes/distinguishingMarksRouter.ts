import multer from 'multer'
import { RequestHandler, Router } from 'express'
import { CorePersonRecordPermission, prisonerPermissionsGuard } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { getRequest, postRequest } from './routerUtils'
import { formatName } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import DistinguishingMarksController from '../controllers/distinguishingMarksController'
import { Services } from '../services'
import validationMiddleware from '../middleware/validationMiddleware'
import {
  newDetailedDistinguishingMarkValidator,
  newDistinguishingMarkValidator,
  updateDescriptionValidator,
  updateLocationValidator,
  updatePhotoValidator,
} from '../validators/personal/distinguishingMarksValidator'
import { requestBodyFromFlash } from '../utils/requestBodyFromFlash'
import { featureFlagGuard } from '../middleware/featureFlagGuard'
import { editProfileEnabled } from '../utils/featureToggles'
import { allBodyParts } from '../controllers/interfaces/distinguishingMarks/selectionTypes'
import setUpCsrf from '../middleware/setUpCsrf'

// Define valid mark types
export const markTypes = 'tattoo|scar|mark'

// Define valid body parts
const validBodyParts =
  'face|front-and-sides|right-arm|right-leg|right-hand|right-foot|left-arm|left-leg|left-hand|left-foot|back|neck'

export function distinguishingMarksMulterExceptions(path: string): boolean {
  return path.match(`\\/personal\\/(${markTypes})\\/(${validBodyParts})`) != null
}

export default function distinguishingMarksRouter(services: Services): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)
  const { prisonPermissionsService } = services

  const commonMiddleware: RequestHandler[] = [
    featureFlagGuard('Profile Edit', editProfileEnabled),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [CorePersonRecordPermission.edit_distinguishing_marks],
    }),
  ]

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

  const distinguishingMarksController = new DistinguishingMarksController(
    services.distinguishingMarksService,
    services.auditService,
  )

  // Add distinguishing mark
  get('/', ...commonMiddleware, distinguishingMarksController.newDistinguishingMark)
  post(
    '/',
    ...commonMiddleware,
    validationMiddleware([newDistinguishingMarkValidator], {
      redirectBackOnError: true,
    }),
    distinguishingMarksController.postNewDistinguishingMark,
  )

  // Add distinguishing mark with detail
  get(
    `/:bodyPart(${validBodyParts})`,
    ...commonMiddleware,
    setUpCsrf(),
    distinguishingMarksController.newDistinguishingMarkWithDetail,
  )
  post(
    `/:bodyPart(${validBodyParts})`,
    ...commonMiddleware,
    multer().fields(allBodyParts.map(part => ({ name: `file-${part}`, maxCount: 1 }))),
    setUpCsrf(),
    validationMiddleware([newDetailedDistinguishingMarkValidator], {
      redirectBackOnError: true,
      useReq: true,
    }),
    distinguishingMarksController.postNewDistinguishingMarkWithDetail,
  )

  // Edit distinguishing mark
  get('/profile-redirect', ...commonMiddleware, distinguishingMarksController.returnToPrisonerProfileAfterUpdate)
  get('/:markId', ...commonMiddleware, distinguishingMarksController.changeDistinguishingMark)

  // Change body part
  get('/:markId/body-part', ...commonMiddleware, distinguishingMarksController.changeBodyPart)
  post(
    '/:markId/body-part',
    ...commonMiddleware,
    validationMiddleware([newDistinguishingMarkValidator], {
      redirectBackOnError: true,
    }),
    distinguishingMarksController.updateBodyPart,
  )

  // Change location
  get('/:markId/location', ...commonMiddleware, distinguishingMarksController.changeLocation)
  post(
    '/:markId/location',
    ...commonMiddleware,
    validationMiddleware([updateLocationValidator], {
      redirectBackOnError: true,
    }),
    distinguishingMarksController.updateLocation,
  )

  // Change description
  get('/:markId/description', ...commonMiddleware, distinguishingMarksController.changeDescription)
  post(
    '/:markId/description',
    ...commonMiddleware,
    validationMiddleware([updateDescriptionValidator], {
      redirectBackOnError: true,
    }),
    distinguishingMarksController.updateDescription,
  )

  // Change photo
  get('/:markId/photo/:photoId', ...commonMiddleware, distinguishingMarksController.changePhoto)
  post(
    '/:markId/photo/:photoId',
    ...commonMiddleware,
    validationMiddleware([updatePhotoValidator], {
      redirectBackOnError: true,
      useReq: true,
    }),
    distinguishingMarksController.updatePhoto,
  )

  // Add photo
  get('/:markId/photo', ...commonMiddleware, distinguishingMarksController.addNewPhoto)
  post(
    '/:markId/photo',
    ...commonMiddleware,
    validationMiddleware([updatePhotoValidator], {
      redirectBackOnError: true,
      useReq: true,
    }),
    distinguishingMarksController.addPhoto,
  )

  // View all images for a mark
  get(
    '/:markId/all-photos',
    featureFlagGuard('Profile Edit', editProfileEnabled),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [CorePersonRecordPermission.read_distinguishing_marks],
    }),
    distinguishingMarksController.viewAllImages,
  )

  return router
}
