import { NextFunction, Request, Response, Router } from 'express'
import { Services } from '../services'
import AppointmentController from '../controllers/appointmentController'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import validationMiddleware from '../middleware/validationMiddleware'
import { AppointmentValidator } from '../validators/appointmentValidator'
import { PrePostAppointmentValidator } from '../validators/prePostAppointmentValidator'
import config from '../config'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { ApiAction, Page } from '../services/auditService'
import isServiceNavEnabled from '../utils/isServiceEnabled'
import { getRequest, postRequest } from './routerUtils'
import permissionsGuard from '../middleware/permissionsGuard'
import NotFoundError from '../utils/notFoundError'

export default function appointmentRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)
  const post = postRequest(router)
  const basePath = '/prisoner/:prisonerNumber([a-zA-Z][0-9]{4}[a-zA-Z]{2})'

  const appointmentController = new AppointmentController(
    services.appointmentService,
    services.prisonerSearchService,
    services.auditService,
    services.locationDetailsService,
  )

  const isCreateIndividualAppointmentRolledOut = (req: Request, res: Response, next: NextFunction) => {
    if (isServiceNavEnabled('activities', res.locals.feComponents?.sharedData)) {
      const { prisonerNumber } = req.params
      res.redirect(`${config.serviceUrls.appointments}/create/start-prisoner/${prisonerNumber}`)
    } else {
      next()
    }
  }

  const isEditAppointmentEnabled = async (req: Request, res: Response, next: NextFunction) => {
    const { appointmentId, prisonerNumber } = req.params
    const { clientToken } = req.middleware
    const appointment = await services.appointmentService.getAppointment(clientToken, +appointmentId)
    if (
      appointment.appointment.appointmentTypeCode === 'VLB' &&
      appointment.appointment.offenderNo === prisonerNumber
    ) {
      return next()
    }
    return next(new NotFoundError())
  }

  get(
    `${basePath}/add-appointment`,
    auditPageAccessAttempt({ services, page: Page.AddAppointment }),
    isCreateIndividualAppointmentRolledOut,
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getAppointmentPermissions),
    appointmentController.displayAddAppointment(),
  )
  post(
    `${basePath}/add-appointment`,
    auditPageAccessAttempt({ services, page: Page.PostAddAppointment }),
    validationMiddleware([AppointmentValidator]),
    appointmentController.post(),
  )
  get(
    `${basePath}/edit-appointment/:appointmentId`,
    auditPageAccessAttempt({ services, page: Page.EditAppointment }),
    isEditAppointmentEnabled,
    isCreateIndividualAppointmentRolledOut,
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getAppointmentPermissions),
    appointmentController.displayAddAppointment(),
  )
  post(
    `${basePath}/edit-appointment/:appointmentId`,
    auditPageAccessAttempt({ services, page: Page.PostEditAppointment }),
    isEditAppointmentEnabled,
    validationMiddleware([AppointmentValidator]),
    appointmentController.post(),
  )
  get(
    `${basePath}/appointment-confirmation`,
    auditPageAccessAttempt({ services, page: Page.AppointmentConfirmation }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getAppointmentPermissions),
    appointmentController.displayAppointmentConfirmation(),
  )

  get(
    `${basePath}/prepost-appointments`,
    auditPageAccessAttempt({ services, page: Page.PrePostAppointments }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getAppointmentPermissions),
    appointmentController.displayPrePostAppointments(),
  )
  post(
    `${basePath}/prepost-appointments`,
    auditPageAccessAttempt({ services, page: Page.PostPrePostAppointments }),
    validationMiddleware([PrePostAppointmentValidator]),
    appointmentController.postVideoLinkBooking(),
  )
  get(
    `${basePath}/edit-prepost-appointments/:appointmentId`,
    auditPageAccessAttempt({ services, page: Page.EditPrePostAppointments }),
    isEditAppointmentEnabled,
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getAppointmentPermissions),
    appointmentController.displayPrePostAppointments(),
  )
  post(
    `${basePath}/edit-prepost-appointments/:appointmentId`,
    auditPageAccessAttempt({ services, page: Page.PostEditPrePostAppointments }),
    isEditAppointmentEnabled,
    validationMiddleware([PrePostAppointmentValidator]),
    appointmentController.postVideoLinkBooking(),
  )
  get(
    `${basePath}/prepost-appointment-confirmation`,
    auditPageAccessAttempt({ services, page: Page.PrePostAppointmentConfirmation }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getAppointmentPermissions),
    appointmentController.displayPrePostAppointmentConfirmation(),
  )

  get(
    `${basePath}/movement-slips`,
    auditPageAccessAttempt({ services, page: Page.AppointmentMovementSlips }),
    getPrisonerData(services),
    permissionsGuard(services.permissionsService.getAppointmentPermissions),
    appointmentController.displayPrisonerMovementSlips(),
  )

  /**
   * API Routes - called from JavaScript on page
   */
  get(
    '/api/get-offender-events',
    auditPageAccessAttempt({ services, page: ApiAction.OffenderEvents }),
    isCreateIndividualAppointmentRolledOut,
    getPrisonerData(services, { minimal: true }),
    permissionsGuard(services.permissionsService.getAppointmentPermissions),
    appointmentController.getOffenderEvents(),
  )

  get(
    '/api/get-location-events',
    auditPageAccessAttempt({ services, page: ApiAction.LocationEvents }),
    isCreateIndividualAppointmentRolledOut,
    appointmentController.getLocationExistingEvents(),
  )

  get('/api/get-recurring-end-date', appointmentController.getRecurringEndDate())

  return router
}
