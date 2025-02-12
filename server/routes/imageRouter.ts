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
      const prisonerData = req.middleware?.prisonerData
      const inmateDetail = req.middleware?.inmateDetail
      const alertSummaryData = req.middleware?.alertSummaryData
      const clientToken = req.middleware?.clientToken
      const imageDetail = await services.photoService.getImageDetail(inmateDetail.facialImageId, clientToken)

      await services.auditService.sendPageView({
        user: res.locals.user,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: Page.Photo,
      })

      res.render('pages/photoPage', {
        pageTitle: `Picture of ${prisonerData.prisonerNumber}`,
        ...mapHeaderData(prisonerData, inmateDetail, alertSummaryData, res.locals.user),
        miniBannerData: {
          prisonerName: formatName(prisonerData.firstName, '', prisonerData.lastName, {
            style: NameFormatStyle.firstLast,
          }),
          prisonerNumber: prisonerData.prisonerNumber,
        },
        imageUploadedDate: formatDateTime(imageDetail.captureDateTime, 'long'),
      })
    },
  )

  get(
    `${basePath}/image/all`,
    auditPageAccessAttempt({ services, page: Page.Photo }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getOverviewPermissions),
    async (req, res, next) => {
      const prisonerData = req.middleware?.prisonerData
      const inmateDetail = req.middleware?.inmateDetail
      const alertSummaryData = req.middleware?.alertSummaryData
      const clientToken = req.middleware?.clientToken
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

      res.render('pages/photoPageAll', {
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
