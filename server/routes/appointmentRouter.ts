import { NextFunction, Request, Response, Router } from 'express'
import { prisonerPermissionsGuard, PrisonerSchedulePermission } from '@ministryofjustice/hmpps-prison-permissions-lib'
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
import NotFoundError from '../utils/notFoundError'

export default function appointmentRouter(services: Services): Router {
  const router = Router()
  const basePath = '/prisoner/:prisonerNumber'
  const { prisonPermissionsService } = services

  const appointmentController = new AppointmentController(
    services.appointmentService,
    services.locationDetailsService,
    services.ephemeralDataService,
    services.auditService,
  )

  const isCreateIndividualAppointmentRolledOut = (req: Request, res: Response, next: NextFunction) => {
    if (isServiceNavEnabled('activities', res.locals.feComponents?.sharedData)) {
      const { prisonerNumber } = req.params
      res.redirect(`${config.serviceUrls.appointments}/create/start-prisoner/${prisonerNumber}`)
    } else {
      next()
    }
  }

  const isEditAppointmentEnabled = async (req: Request, _res: Response, next: NextFunction) => {
    const { appointmentId, prisonerNumber } = req.params
    const { clientToken } = req.middleware
    const appointment = await services.appointmentService.getAppointment(clientToken, +appointmentId)
    if (
      (appointment.appointment.appointmentTypeCode === 'VLB' ||
        appointment.appointment.appointmentTypeCode === 'VLPM') &&
      appointment.appointment.offenderNo === prisonerNumber
    ) {
      return next()
    }
    return next(new NotFoundError())
  }

  router.get(
    `${basePath}/add-appointment`,
    auditPageAccessAttempt({ services, page: Page.AddAppointment }),
    isCreateIndividualAppointmentRolledOut,
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [PrisonerSchedulePermission.edit_appointment],
    }),
    appointmentController.displayAddAppointment(),
  )

  router.post(
    `${basePath}/add-appointment`,
    auditPageAccessAttempt({ services, page: Page.PostAddAppointment }),
    validationMiddleware([AppointmentValidator]),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [PrisonerSchedulePermission.edit_appointment],
    }),
    appointmentController.post(),
  )

  router.get(
    `${basePath}/edit-appointment/:appointmentId`,
    auditPageAccessAttempt({ services, page: Page.EditAppointment }),
    isEditAppointmentEnabled,
    isCreateIndividualAppointmentRolledOut,
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [PrisonerSchedulePermission.edit_appointment],
    }),
    appointmentController.displayAddAppointment(),
  )

  router.post(
    `${basePath}/edit-appointment/:appointmentId`,
    auditPageAccessAttempt({ services, page: Page.PostEditAppointment }),
    isEditAppointmentEnabled,
    validationMiddleware([AppointmentValidator]),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [PrisonerSchedulePermission.edit_appointment],
    }),
    appointmentController.post(),
  )

  router.get(
    `${basePath}/appointment-confirmation`,
    auditPageAccessAttempt({ services, page: Page.AppointmentConfirmation }),
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [PrisonerSchedulePermission.edit_appointment],
    }),
    appointmentController.displayAppointmentConfirmation(),
  )

  router.get(
    `${basePath}/prepost-appointments`,
    auditPageAccessAttempt({ services, page: Page.PrePostAppointments }),
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [PrisonerSchedulePermission.edit_appointment],
    }),
    appointmentController.displayPrePostAppointments(),
  )

  router.post(
    `${basePath}/prepost-appointments`,
    auditPageAccessAttempt({ services, page: Page.PostPrePostAppointments }),
    validationMiddleware([PrePostAppointmentValidator]),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [PrisonerSchedulePermission.edit_appointment],
    }),
    appointmentController.postVideoLinkBooking(),
  )

  router.get(
    `${basePath}/edit-prepost-appointments/:appointmentId`,
    auditPageAccessAttempt({ services, page: Page.EditPrePostAppointments }),
    isEditAppointmentEnabled,
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [PrisonerSchedulePermission.edit_appointment],
    }),
    appointmentController.displayPrePostAppointments(),
  )

  router.post(
    `${basePath}/edit-prepost-appointments/:appointmentId`,
    auditPageAccessAttempt({ services, page: Page.PostEditPrePostAppointments }),
    isEditAppointmentEnabled,
    validationMiddleware([PrePostAppointmentValidator]),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [PrisonerSchedulePermission.edit_appointment],
    }),
    appointmentController.postVideoLinkBooking(),
  )

  router.get(
    `${basePath}/prepost-appointment-confirmation`,
    auditPageAccessAttempt({ services, page: Page.PrePostAppointmentConfirmation }),
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [PrisonerSchedulePermission.edit_appointment],
    }),
    appointmentController.displayPrePostAppointmentConfirmation(),
  )

  router.get(
    `${basePath}/movement-slips`,
    auditPageAccessAttempt({ services, page: Page.AppointmentMovementSlips }),
    getPrisonerData(services),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [PrisonerSchedulePermission.edit_appointment],
    }),
    appointmentController.displayPrisonerMovementSlips(),
  )

  /**
   * API Routes - called from JavaScript on page
   */
  router.get(
    '/api/get-offender-events',
    auditPageAccessAttempt({ services, page: ApiAction.OffenderEvents }),
    isCreateIndividualAppointmentRolledOut,
    getPrisonerData(services, { minimal: true }),
    prisonerPermissionsGuard(prisonPermissionsService, {
      requestDependentOn: [PrisonerSchedulePermission.edit_appointment],
    }),
    appointmentController.getOffenderEvents(),
  )

  router.get(
    '/api/get-location-events',
    auditPageAccessAttempt({ services, page: ApiAction.LocationEvents }),
    isCreateIndividualAppointmentRolledOut,
    appointmentController.getLocationExistingEvents(),
  )

  router.get('/api/get-recurring-end-date', appointmentController.getRecurringEndDate())

  return router
}
