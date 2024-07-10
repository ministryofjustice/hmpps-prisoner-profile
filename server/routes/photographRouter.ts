import { Router } from 'express'
import multer from 'multer'
import dpsComponents from '@ministryofjustice/hmpps-connect-dps-components'
import { Services } from '../services'
import { getRequest, postRequest } from './routerUtils'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import permissionsGuard from '../middleware/permissionsGuard'
import PhotographController from '../controllers/photographController'
import { formatName } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import config from '../config'
import logger from '../../logger'

const uploadToBuffer = multer({ storage: multer.memoryStorage() })

export default function photographRouter(services: Services): Router {
  const router = Router({ mergeParams: true })
  const get = getRequest(router)
  const post = postRequest(router)

  router.use(getPrisonerData(services, { minimal: true }))
  router.use(permissionsGuard(services.permissionsService.getEditProfileAccessStatusCode))
  router.use((req, res, next) => {
    // set some prisoner data to use in the views
    const { firstName, lastName, prisonerNumber } = req.middleware.prisonerData
    const formattedData = {
      breadcrumbPrisonerName: formatName(firstName, null, lastName, {
        style: NameFormatStyle.lastCommaFirst,
      }),
      prisonerName: formatName(firstName, null, lastName),
      prisonerNumber,
    }

    res.locals = { ...res.locals, ...formattedData }
    next()
  })

  const photoController = new PhotographController(services.documentService)

  get('/upload', photoController.displayUploadPage)
  post(
    '/upload',
    uploadToBuffer.single('photoUpload'),
    dpsComponents.getPageComponents({ logger, dpsUrl: config.serviceUrls.digitalPrison }),
    photoController.displayEditPage,
  )
  post('/submit', multer().single('editedFile'), photoController.submitPhotograph)

  // just for demonstration purposes
  get('/view/:uuid', photoController.getPhotoFile)
  get('/all', photoController.getAllPhotosForPrisoner)

  return router
}
