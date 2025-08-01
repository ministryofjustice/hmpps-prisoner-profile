import { RequestHandler, Router } from 'express'
import dpsComponents from '@ministryofjustice/hmpps-connect-dps-components'
import { CorePersonRecordPermission, prisonerPermissionsGuard } from '@ministryofjustice/hmpps-prison-permissions-lib'
import { Services } from '../services'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import { getRequest, postRequest } from './routerUtils'
import { mapHeaderData } from '../mappers/headerMappers'
import { formatName } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { formatDateTime } from '../utils/dateHelpers'
import NotFoundError from '../utils/notFoundError'
import { PrisonUser } from '../interfaces/HmppsUser'
import { editProfileEnabled } from '../utils/featureToggles'
import config from '../config'
import logger from '../../logger'
import validationMiddleware from '../middleware/validationMiddleware'
import { editPhotoValidator } from '../validators/editPhotoValidator'
import ImageController from '../controllers/imageController'
import { imagePageBreadcrumbs } from '../mappers/imagePageBreadcrumbs'
import { featureFlagGuard } from '../middleware/featureFlagGuard'

export default function imageRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)
  const post = postRequest(router)
  const basePath = '/prisoner/:prisonerNumber([a-zA-Z][0-9]{4}[a-zA-Z]{2})'
  const { prisonPermissionsService } = services
  const imageController = new ImageController(
    services.dataAccess.personIntegrationApiClientBuilder,
    services.dataAccess.prisonerProfileApiClientBuilder,
    services.auditService,
    services.metricsService,
  )

  const buildBreadcrumbsAndReferer: (includeFacialImagesLink?: boolean) => RequestHandler = (
    includeFacialImagesLink = false,
  ) => {
    return (req, res, next) => {
      const { prisonerData } = req.middleware
      const { prisonerNumber } = prisonerData
      const prisonerName = formatName(prisonerData.firstName, '', prisonerData.lastName, {
        style: NameFormatStyle.lastCommaFirst,
      })

      const referer = req.query.referer as string
      res.locals.referer = referer
      const breadcrumbs = imagePageBreadcrumbs(prisonerName, prisonerNumber, referer)
      if (includeFacialImagesLink) {
        breadcrumbs.push({
          text: 'Facial images',
          href: `/prisoner/${prisonerNumber}/image`,
        })
      }
      res.locals.breadCrumbs = breadcrumbs
      next()
    }
  }

  get(
    `${basePath}/image`,
    auditPageAccessAttempt({ services, page: Page.Photo }),
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [CorePersonRecordPermission.read_photo] }),
    buildBreadcrumbsAndReferer(),
    async (req, res, next) => {
      const { prisonerData, inmateDetail, alertSummaryData, clientToken } = req.middleware
      const { activeCaseLoadId } = res.locals.user as PrisonUser
      const photoStatus = services.photoService.getPhotoStatus(prisonerData, inmateDetail, alertSummaryData)
      const { prisonerNumber } = prisonerData
      const prisonerName = formatName(prisonerData.firstName, '', prisonerData.lastName, {
        style: NameFormatStyle.lastCommaFirst,
      })
      let imageUploadedDate = ''

      // As long as there's a photo ID we can get information about it
      if (!photoStatus.placeholder) {
        const imageDetail = await services.photoService.getImageDetail(inmateDetail.facialImageId, clientToken)
        imageUploadedDate = formatDateTime(imageDetail.captureDateTime, 'long')
      }

      await services.auditService.sendPageView({
        user: res.locals.user,
        prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: Page.Photo,
      })

      return res.render('pages/photoPage', {
        pageTitle: `Picture of ${prisonerNumber}`,
        ...mapHeaderData(prisonerData, inmateDetail, alertSummaryData, res.locals.user),
        miniBannerData: {
          prisonerName,
          prisonerNumber,
        },
        imageUploadedDate,
        photoStatus,
        editEnabled: editProfileEnabled(activeCaseLoadId),
      })
    },
  )

  get(
    `${basePath}/image/all`,
    auditPageAccessAttempt({ services, page: Page.Photo }),
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [CorePersonRecordPermission.read_photo] }),
    buildBreadcrumbsAndReferer(),
    async (req, res, next) => {
      const { activeCaseLoadId } = res.locals.user as PrisonUser
      const { prisonerData, inmateDetail, alertSummaryData, clientToken } = req.middleware
      const { prisonerNumber } = prisonerData
      const prisonerName = formatName(prisonerData.firstName, '', prisonerData.lastName, {
        style: NameFormatStyle.lastCommaFirst,
      })
      const photoStatus = services.photoService.getPhotoStatus(prisonerData, inmateDetail, alertSummaryData)

      // Do not display this page for prisoners with their photos withheld or with no image
      if (photoStatus.withheld || photoStatus.placeholder) {
        return next(new NotFoundError())
      }

      const facialImages = await services.photoService.getAllFacialPhotos(
        prisonerNumber,
        inmateDetail.facialImageId,
        clientToken,
      )

      await services.auditService.sendPageView({
        user: res.locals.user,
        prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: Page.PhotoList,
      })

      return res.render('pages/photoPageAll', {
        pageTitle: `All facial images`,
        ...mapHeaderData(prisonerData, inmateDetail, alertSummaryData, res.locals.user),
        miniBannerData: {
          prisonerName,
          prisonerNumber,
        },
        facialImages,
        editEnabled: editProfileEnabled(activeCaseLoadId),
      })
    },
  )

  get(
    `${basePath}/image/new`,
    auditPageAccessAttempt({ services, page: Page.EditProfileImage }),
    getPrisonerData(services),
    featureFlagGuard('Profile Edit', editProfileEnabled),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [CorePersonRecordPermission.edit_photo] }),
    buildBreadcrumbsAndReferer(true),
    imageController.updateProfileImage().newImage.get,
  )

  post(
    `${basePath}/image/new`,
    auditPageAccessAttempt({ services, page: Page.EditUploadedProfileImage }),
    getPrisonerData(services),
    featureFlagGuard('Profile Edit', editProfileEnabled),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [CorePersonRecordPermission.edit_photo] }),
    dpsComponents.getPageComponents({
      logger,
      includeSharedData: true,
      dpsUrl: config.serviceUrls.digitalPrison,
    }),
    validationMiddleware([editPhotoValidator], {
      redirectBackOnError: true,
      useReq: true,
    }),
    buildBreadcrumbsAndReferer(true),
    imageController.updateProfileImage().newImage.post,
  )

  post(
    `${basePath}/image/submit`,
    auditPageAccessAttempt({ services, page: Page.Photo }),
    getPrisonerData(services),
    featureFlagGuard('Profile Edit', editProfileEnabled),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [CorePersonRecordPermission.edit_photo] }),
    dpsComponents.getPageComponents({
      logger,
      includeSharedData: true,
      dpsUrl: config.serviceUrls.digitalPrison,
    }),
    buildBreadcrumbsAndReferer(true),
    imageController.updateProfileImage().submitImage,
  )

  get(
    `${basePath}/image/new-withheld`,
    auditPageAccessAttempt({ services, page: Page.EditProfileImageWithheld }),
    getPrisonerData(services),
    featureFlagGuard('Profile Edit', editProfileEnabled),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [CorePersonRecordPermission.edit_photo] }),
    buildBreadcrumbsAndReferer(true),
    imageController.updateProfileImage().newWithheldImage.get,
  )

  post(
    `${basePath}/image/new-withheld`,
    auditPageAccessAttempt({ services, page: Page.PostEditProfileImageWithheld }),
    getPrisonerData(services),
    featureFlagGuard('Profile Edit', editProfileEnabled),
    prisonerPermissionsGuard(prisonPermissionsService, { requestDependentOn: [CorePersonRecordPermission.edit_photo] }),
    buildBreadcrumbsAndReferer(true),
    imageController.updateProfileImage().newWithheldImage.post,
  )

  return router
}
