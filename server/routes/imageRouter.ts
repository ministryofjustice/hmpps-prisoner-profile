import { NextFunction, Request, Response, Router } from 'express'
import dpsComponents from '@ministryofjustice/hmpps-connect-dps-components'
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
import config from '../config'
import logger from '../../logger'
import validationMiddleware from '../middleware/validationMiddleware'
import { editPhotoValidator } from '../validators/editPhotoValidator'
import ImageController from '../controllers/imageController'

export default function imageRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)
  const post = postRequest(router)
  const basePath = '/prisoner/:prisonerNumber([a-zA-Z][0-9]{4}[a-zA-Z]{2})'
  const imageController = new ImageController(
    services.dataAccess.personIntegrationApiClientBuilder,
    services.dataAccess.prisonerProfileApiClientBuilder,
    services.auditService,
  )

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

  const editProfileChecks = () => (req: Request, res: Response, next: NextFunction) => {
    const { userRoles, activeCaseLoadId } = res.locals.user as PrisonUser
    if (userHasRoles(['DPS_APPLICATION_DEVELOPER'], userRoles) && editProfileEnabled(activeCaseLoadId)) {
      return next()
    }
    return next(new NotFoundError('User cannot access edit routes', HmppsStatusCode.NOT_FOUND))
  }

  get(
    `${basePath}/image/new`,
    auditPageAccessAttempt({ services, page: Page.EditProfileImage }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    editProfileChecks(),
    imageController.updateProfileImage().newImage.get,
  )

  post(
    `${basePath}/image/new`,
    auditPageAccessAttempt({ services, page: Page.EditUploadedProfileImage }),
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
    imageController.updateProfileImage().newImage.post,
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
    imageController.updateProfileImage().submitImage,
  )

  get(
    `${basePath}/image/new-withheld`,
    auditPageAccessAttempt({ services, page: Page.EditProfileImageWithheld }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    editProfileChecks(),
    imageController.updateProfileImage().newWithheldImage.get,
  )

  post(
    `${basePath}/image/new-withheld`,
    auditPageAccessAttempt({ services, page: Page.PostEditProfileImageWithheld }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    editProfileChecks(),
    imageController.updateProfileImage().newWithheldImage.post,
  )

  return router
}
