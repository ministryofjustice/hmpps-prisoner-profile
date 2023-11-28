import { NextFunction, Request, RequestHandler, Response, Router } from 'express'
import { Services } from '../services'
import asyncMiddleware from '../middleware/asyncMiddleware'
import AppointmentController from '../controllers/appointmentController'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import checkPrisonerInCaseload from '../middleware/checkPrisonerInCaseloadMiddleware'
import validationMiddleware from '../middleware/validationMiddleware'
import { AppointmentValidator } from '../validators/appointmentValidator'
import { PrePostAppointmentValidator } from '../validators/prePostAppointmentValidator'
import config from '../config'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { ApiAction, Page } from '../services/auditService'

export default function appointmentRouter(services: Services): Router {
  const router = Router()

  const get = (path: string | string[], ...handlers: RequestHandler[]) =>
    router.get(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )

  const post = (path: string | string[], ...handlers: RequestHandler[]) =>
    router.post(
      path,
      handlers.map(handler => asyncMiddleware(handler)),
    )

  const appointmentController = new AppointmentController(
    services.appointmentService,
    services.prisonerSearchService,
    services.auditService,
  )

  const isCreateIndividualAppointmentRolledOut = (req: Request, res: Response, next: NextFunction) => {
    const { activeCaseLoadId } = res.locals.user
    if (config.appointmentsEnabledPrisons.includes(activeCaseLoadId)) {
      const { prisonerNumber } = req.params
      res.redirect(`${config.serviceUrls.appointments}/create/start-prisoner/${prisonerNumber}`)
    } else {
      next()
    }
  }

  get(
    '/prisoner/:prisonerNumber/add-appointment',
    auditPageAccessAttempt({ services, page: Page.AddAppointment }),
    isCreateIndividualAppointmentRolledOut,
    getPrisonerData(services),
    checkPrisonerInCaseload({ activeCaseloadOnly: true }),
    appointmentController.displayAddAppointment(),
  )
  post(
    '/prisoner/:prisonerNumber/add-appointment',
    auditPageAccessAttempt({ services, page: Page.PostAddAppointment }),
    validationMiddleware(AppointmentValidator),
    appointmentController.post(),
  )
  get(
    '/prisoner/:prisonerNumber/appointment-confirmation',
    auditPageAccessAttempt({ services, page: Page.AppointmentConfirmation }),
    getPrisonerData(services),
    checkPrisonerInCaseload({ activeCaseloadOnly: true }),
    appointmentController.displayAppointmentConfirmation(),
  )

  get(
    '/prisoner/:prisonerNumber/prepost-appointments',
    auditPageAccessAttempt({ services, page: Page.PrePostAppointments }),
    getPrisonerData(services),
    checkPrisonerInCaseload({ activeCaseloadOnly: true }),
    appointmentController.displayPrePostAppointments(),
  )
  post(
    '/prisoner/:prisonerNumber/prepost-appointments',
    auditPageAccessAttempt({ services, page: Page.PostPrePostAppointments }),
    validationMiddleware(PrePostAppointmentValidator),
    appointmentController.postVideoLinkBooking(),
  )
  get(
    '/prisoner/:prisonerNumber/prepost-appointment-confirmation',
    auditPageAccessAttempt({ services, page: Page.PrePostAppointmentConfirmation }),
    getPrisonerData(services),
    checkPrisonerInCaseload({ activeCaseloadOnly: true }),
    appointmentController.displayPrePostAppointmentConfirmation(),
  )

  get(
    '/prisoner/:prisonerNumber/movement-slips',
    auditPageAccessAttempt({ services, page: Page.AppointmentMovementSlips }),
    getPrisonerData(services),
    checkPrisonerInCaseload({ activeCaseloadOnly: true }),
    appointmentController.displayPrisonerMovementSlips(),
  )

  /**
   * API Routes - called from JavaScript on page
   */
  get(
    '/api/get-offender-events',
    auditPageAccessAttempt({ services, page: ApiAction.OffenderEvents }),
    appointmentController.getOffenderEvents(),
  )

  get(
    '/api/get-location-events',
    auditPageAccessAttempt({ services, page: ApiAction.LocationEvents }),
    appointmentController.getLocationExistingEvents(),
  )

  get('/api/get-recurring-end-date', appointmentController.getRecurringEndDate())

  return router
}
