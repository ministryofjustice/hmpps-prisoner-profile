import multer from 'multer'
import { RequestHandler, Router } from 'express'
import { CorePersonRecordPermission, prisonerPermissionsGuard } from '@ministryofjustice/hmpps-prison-permissions-lib'
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
import { parameterGuard } from '../middleware/parameterGuard'

// Define valid mark types
export const markTypes = ['tattoo', 'scar', 'mark']

// Define valid body parts
const validBodyParts = [
  'face',
  'front-and-sides',
  'right-arm',
  'right-leg',
  'right-hand',
  'right-foot',
  'left-arm',
  'left-leg',
  'left-hand',
  'left-foot',
  'back',
  'neck',
]

export function distinguishingMarksMulterExceptions(path: string): boolean {
  return (
    path.match(`\\/personal\\/distinguishing-marks\\/(${markTypes.join('|')})\\/(${validBodyParts.join('|')})`) != null
  )
}

export default function distinguishingMarksRouter(services: Services): Router {
  const router = Router({ mergeParams: true })
  const { prisonPermissionsService } = services

  const commonMiddleware: RequestHandler[] = [
    featureFlagGuard('Profile Edit', editProfileEnabled),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [CorePersonRecordPermission.edit_distinguishing_marks],
    }),
  ]

  router.get('*splat', (req, res, next) => {
    res.locals = { ...res.locals, errors: req.flash('errors'), formValues: requestBodyFromFlash(req) }
    next()
  })

  const distinguishingMarksController = new DistinguishingMarksController(
    services.distinguishingMarksService,
    services.auditService,
  )

  // Add distinguishing mark
  router.get('/', ...commonMiddleware, distinguishingMarksController.newDistinguishingMark)
  router.post(
    '/',
    ...commonMiddleware,
    validationMiddleware([newDistinguishingMarkValidator], {
      redirectBackOnError: true,
    }),
    distinguishingMarksController.postNewDistinguishingMark,
  )

  // Add distinguishing mark with detail
  router.get(
    `/:bodyPart/detail`,
    parameterGuard('bodyPart', validBodyParts),
    ...commonMiddleware,
    setUpCsrf(),
    distinguishingMarksController.newDistinguishingMarkWithDetail,
  )
  router.post(
    `/:bodyPart/detail`,
    parameterGuard('bodyPart', validBodyParts),
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
  router.get('/profile-redirect', ...commonMiddleware, distinguishingMarksController.returnToPrisonerProfileAfterUpdate)
  router.get('/:markId', ...commonMiddleware, distinguishingMarksController.changeDistinguishingMark)

  // Change body part
  router.get('/:markId/body-part', ...commonMiddleware, distinguishingMarksController.changeBodyPart)
  router.post(
    '/:markId/body-part',
    ...commonMiddleware,
    validationMiddleware([newDistinguishingMarkValidator], {
      redirectBackOnError: true,
    }),
    distinguishingMarksController.updateBodyPart,
  )

  // Change location
  router.get('/:markId/location', ...commonMiddleware, distinguishingMarksController.changeLocation)
  router.post(
    '/:markId/location',
    ...commonMiddleware,
    validationMiddleware([updateLocationValidator], {
      redirectBackOnError: true,
    }),
    distinguishingMarksController.updateLocation,
  )

  // Change description
  router.get('/:markId/description', ...commonMiddleware, distinguishingMarksController.changeDescription)
  router.post(
    '/:markId/description',
    ...commonMiddleware,
    validationMiddleware([updateDescriptionValidator], {
      redirectBackOnError: true,
    }),
    distinguishingMarksController.updateDescription,
  )

  // Change photo
  router.get('/:markId/photo/:photoId', ...commonMiddleware, distinguishingMarksController.changePhoto)
  router.post(
    '/:markId/photo/:photoId',
    ...commonMiddleware,
    validationMiddleware([updatePhotoValidator], {
      redirectBackOnError: true,
      useReq: true,
    }),
    distinguishingMarksController.updatePhoto,
  )

  // Add photo
  router.get('/:markId/photo', ...commonMiddleware, distinguishingMarksController.addNewPhoto)
  router.post(
    '/:markId/photo',
    ...commonMiddleware,
    validationMiddleware([updatePhotoValidator], {
      redirectBackOnError: true,
      useReq: true,
    }),
    distinguishingMarksController.addPhoto,
  )

  // View all images for a mark
  router.get(
    '/:markId/all-photos',
    featureFlagGuard('Profile Edit', editProfileEnabled),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [CorePersonRecordPermission.read_distinguishing_marks],
    }),
    distinguishingMarksController.viewAllImages,
  )

  return router
}
