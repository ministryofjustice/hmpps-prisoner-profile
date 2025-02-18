import { Router } from 'express'
import { Services } from '../services'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { Page } from '../services/auditService'
import { getRequest } from './routerUtils'
import permissionsGuard from '../middleware/permissionsGuard'
import { mapHeaderData } from '../mappers/headerMappers'
import { formatName } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { formatDateTime } from '../utils/dateHelpers'
import NotFoundError from '../utils/notFoundError'

export default function goalsRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)
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

  return router
}
