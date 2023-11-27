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

  const appointmentController = new AppointmentController(services.appointmentService, services.prisonerSearchService)

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
    isCreateIndividualAppointmentRolledOut,
    getPrisonerData(services),
    checkPrisonerInCaseload({ activeCaseloadOnly: true }),
    appointmentController.displayAddAppointment(),
  )
  post(
    '/prisoner/:prisonerNumber/add-appointment',
    validationMiddleware(AppointmentValidator),
    appointmentController.post(),
  )
  get(
    '/prisoner/:prisonerNumber/appointment-confirmation',
    getPrisonerData(services),
    checkPrisonerInCaseload({ activeCaseloadOnly: true }),
    appointmentController.displayAppointmentConfirmation(),
  )

  get(
    '/prisoner/:prisonerNumber/prepost-appointments',
    getPrisonerData(services),
    checkPrisonerInCaseload({ activeCaseloadOnly: true }),
    appointmentController.displayPrePostAppointments(),
  )
  post(
    '/prisoner/:prisonerNumber/prepost-appointments',
    validationMiddleware(PrePostAppointmentValidator),
    appointmentController.postVideoLinkBooking(),
  )
  get(
    '/prisoner/:prisonerNumber/prepost-appointment-confirmation',
    getPrisonerData(services),
    checkPrisonerInCaseload({ activeCaseloadOnly: true }),
    appointmentController.displayPrePostAppointmentConfirmation(),
  )

  get(
    '/prisoner/:prisonerNumber/movement-slips',
    getPrisonerData(services),
    checkPrisonerInCaseload({ activeCaseloadOnly: true }),
    appointmentController.displayPrisonerMovementSlips(),
  )

  /**
   * API Routes - called from JavaScript on page
   */
  get('/api/get-offender-events', appointmentController.getOffenderEvents())

  get('/api/get-location-events', appointmentController.getLocationExistingEvents())

  get('/api/get-recurring-end-date', appointmentController.getRecurringEndDate())

  return router
}
