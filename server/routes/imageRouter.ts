import { NextFunction, Request, Response, Router } from 'express'
import multer from 'multer'
import dpsComponents from '@ministryofjustice/hmpps-connect-dps-components'
import MulterFile from '../controllers/interfaces/MulterFile'
import { Services } from '../services'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import { getRequest, postRequest } from './routerUtils'
import permissionsGuard from '../middleware/permissionsGuard'
import { mapHeaderData } from '../mappers/headerMappers'
import { formatName, userHasRoles } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { formatDateTime } from '../utils/dateHelpers'
import NotFoundError from '../utils/notFoundError'
import { PrisonUser } from '../interfaces/HmppsUser'
import { editProfileEnabled } from '../utils/featureToggles'
import { HmppsStatusCode } from '../data/enums/hmppsStatusCode'
import miniBannerData from '../controllers/utils/miniBannerData'
import config from '../config'
import logger from '../../logger'
import validationMiddleware from '../middleware/validationMiddleware'
import { requestBodyFromFlash } from '../utils/requestBodyFromFlash'
import { editPhotoValidator } from '../validators/editPhotoValidator'

export default function imageRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)
  const post = postRequest(router)
  const basePath = '/prisoner/:prisonerNumber([a-zA-Z][0-9]{4}[a-zA-Z]{2})'

  get(
    `${basePath}/image`,
    auditPageAccessAttempt({ services, page: Page.Photo }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    async (req, res, next) => {
      const { prisonerData, inmateDetail, alertSummaryData, clientToken } = req.middleware
      const photoStatus = services.photoService.getPhotoStatus(prisonerData, inmateDetail, alertSummaryData)
      let imageUploadedDate = ''

      // As long as there's a photo ID we can get information about it
      if (!photoStatus.placeholder) {
        const imageDetail = await services.photoService.getImageDetail(inmateDetail.facialImageId, clientToken)
        imageUploadedDate = formatDateTime(imageDetail.captureDateTime, 'long')
      }

      await services.auditService.sendPageView({
        user: res.locals.user,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: Page.Photo,
      })

      return res.render('pages/photoPage', {
        pageTitle: `Picture of ${prisonerData.prisonerNumber}`,
        ...mapHeaderData(prisonerData, inmateDetail, alertSummaryData, res.locals.user),
        miniBannerData: {
          prisonerName: formatName(prisonerData.firstName, '', prisonerData.lastName, {
            style: NameFormatStyle.firstLast,
          }),
          prisonerNumber: prisonerData.prisonerNumber,
        },
        imageUploadedDate,
        photoStatus,
      })
    },
  )

  get(
    `${basePath}/image/all`,
    auditPageAccessAttempt({ services, page: Page.Photo }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    async (req, res, next) => {
      const { prisonerData, inmateDetail, alertSummaryData, clientToken } = req.middleware
      const photoStatus = services.photoService.getPhotoStatus(prisonerData, inmateDetail, alertSummaryData)

      // Do not display this page for prisoners with their photos withheld or with no image
      if (photoStatus.withheld || photoStatus.placeholder) {
        return next(new NotFoundError())
      }

      const facialImages = await services.photoService.getAllFacialPhotos(
        prisonerData.prisonerNumber,
        inmateDetail.facialImageId,
        clientToken,
      )

      await services.auditService.sendPageView({
        user: res.locals.user,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: Page.PhotoList,
      })

      return res.render('pages/photoPageAll', {
        pageTitle: `All facial images`,
        ...mapHeaderData(prisonerData, inmateDetail, alertSummaryData, res.locals.user),
        miniBannerData: {
          prisonerName: formatName(prisonerData.firstName, '', prisonerData.lastName, {
            style: NameFormatStyle.firstLast,
          }),
          prisonerNumber: prisonerData.prisonerNumber,
        },
        facialImages,
      })
    },
  )

  // REFACTOR THIS
  const editProfileChecks = () => (req: Request, res: Response, next: NextFunction) => {
    const { userRoles, activeCaseLoadId } = res.locals.user as PrisonUser
    if (userHasRoles(['DPS_APPLICATION_DEVELOPER'], userRoles) && editProfileEnabled(activeCaseLoadId)) {
      return next()
    }
    return next(new NotFoundError('User cannot access edit routes', HmppsStatusCode.NOT_FOUND))
  }

  get(
    `${basePath}/image/new`,
    auditPageAccessAttempt({ services, page: Page.Photo }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    editProfileChecks(),
    async (req, res, next) => {
      const { prisonerData } = req.middleware
      res.locals = { ...res.locals, errors: req.flash('errors'), formValues: requestBodyFromFlash(req) }

      return res.render('pages/edit/photo/addNew', {
        pageTitle: 'Add a new facial image',
        miniBannerData: miniBannerData(prisonerData),
        prisonerNumber: prisonerData.prisonerNumber,
      })
    },
  )

  const uploadToBuffer = multer({ storage: multer.memoryStorage() })

  post(
    `${basePath}/image/new`,
    auditPageAccessAttempt({ services, page: Page.Photo }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    editProfileChecks(),
    dpsComponents.getPageComponents({
      logger,
      includeSharedData: true,
      dpsUrl: config.serviceUrls.digitalPrison,
    }),
    validationMiddleware([editPhotoValidator], {
      redirectBackOnError: true,
      useReq: true,
    }),
    async (req, res, next) => {
      const { prisonerData } = req.middleware
      const file = req.file as MulterFile

      if (req.body.photoType === 'withheld') {
        return res.redirect(`/prisoner/${prisonerData.prisonerNumber}/image/new-withheld`)
      }

      return res.render('pages/edit/photo/editPhoto', {
        miniBannerData: miniBannerData(prisonerData),
        imgSrc: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        prisonerNumber: prisonerData.prisonerNumber,
        fileName: file.originalname,
        fileType: file.mimetype,
      })
    },
  )

  get(
    `${basePath}/image/new-withheld`,
    auditPageAccessAttempt({ services, page: Page.Photo }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    editProfileChecks(),
    async (req, res, next) => {
      const { prisonerData } = req.middleware
      res.locals = { ...res.locals, errors: req.flash('errors'), formValues: requestBodyFromFlash(req) }

      return res.render('pages/edit/photo/addWithheld', {
        pageTitle: 'Confirm facial image',
        miniBannerData: miniBannerData(prisonerData),
        prisonerNumber: prisonerData.prisonerNumber,
      })
    },
  )

  post(
    `${basePath}/image/new-withheld`,
    auditPageAccessAttempt({ services, page: Page.Photo }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    editProfileChecks(),
    async (req, res, next) => {
      const { prisonerData } = req.middleware
      return res.redirect(`/prisoner/${prisonerData.prisonerNumber}/image/new-withheld`)
    },
  )

  post(
    `${basePath}/image/submit`,
    auditPageAccessAttempt({ services, page: Page.Photo }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    editProfileChecks(),
    dpsComponents.getPageComponents({
      logger,
      includeSharedData: true,
      dpsUrl: config.serviceUrls.digitalPrison,
    }),
    uploadToBuffer.single('editedFile'),
    async (req, res, next) => {
      const { prisonerData } = req.middleware
      const file = req.file as MulterFile

      res.render('pages/edit/photo/editPhoto', {
        miniBannerData: miniBannerData(prisonerData),
        imgSrc: `data:${file.mimetype};base64,${file.buffer.toString('base64')}`,
        prisonerNumber: req.middleware.prisonerData.prisonerNumber,
        fileName: file.originalname,
        fileType: file.mimetype,
      })
    },
  )
  return router
}
