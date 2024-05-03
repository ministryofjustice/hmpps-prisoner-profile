import { NextFunction, Request, Response, Router } from 'express'
import { Services } from '../services'
import AppointmentController from '../controllers/appointmentController'
import getPrisonerData from '../middleware/getPrisonerDataMiddleware'
import checkPrisonerInCaseload from '../middleware/checkPrisonerInCaseloadMiddleware'
import validationMiddleware from '../middleware/validationMiddleware'
import { AppointmentValidator } from '../validators/appointmentValidator'
import { PrePostAppointmentValidator } from '../validators/prePostAppointmentValidator'
import config from '../config'
import auditPageAccessAttempt from '../middleware/auditPageAccessAttempt'
import { ApiAction, Page } from '../services/auditService'
import { notifyClient } from '../utils/notifyClient'
import isServiceEnabled from '../utils/isServiceEnabled'
import { getRequest, postRequest } from './routerUtils'

export default function appointmentRouter(services: Services): Router {
  const router = Router()
  const get = getRequest(router)
  const post = postRequest(router)

  const appointmentController = new AppointmentController(
    services.appointmentService,
    services.prisonerSearchService,
    services.auditService,
    notifyClient,
  )

  const isCreateIndividualAppointmentRolledOut = (req: Request, res: Response, next: NextFunction) => {
    if (isServiceEnabled('activities', res.locals.feComponentsMeta)) {
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
    isCreateIndividualAppointmentRolledOut,
    checkPrisonerInCaseload({ activeCaseloadOnly: true }),
    appointmentController.getOffenderEvents(),
  )

  get(
    '/api/get-location-events',
    auditPageAccessAttempt({ services, page: ApiAction.LocationEvents }),
    isCreateIndividualAppointmentRolledOut,
    checkPrisonerInCaseload({ activeCaseloadOnly: true }),
    appointmentController.getLocationExistingEvents(),
  )

  get('/api/get-recurring-end-date', appointmentController.getRecurringEndDate())

  return router
}
