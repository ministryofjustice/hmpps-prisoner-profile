import { NextFunction, Request, RequestHandler, Response } from 'express'
import { addMinutes, set, subMinutes } from 'date-fns'
import AppointmentService from '../services/appointmentService'
import { apostrophe, formatLocation, formatName, objectToSelectOptions, refDataToSelectOptions } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import {
  AppointmentDefaults,
  AppointmentForm,
  PrePostAppointmentDetails,
  repeatOptions,
} from '../interfaces/whereaboutsApi/appointment'
import {
  calculateEndDate,
  dateToIsoDate,
  formatDate,
  formatDateISO,
  formatDateTimeISO,
  parseDate,
  timeFormat,
} from '../utils/dateHelpers'
import { PrisonerSearchService } from '../services'
import { pluralise } from '../utils/pluralise'
import ServerError from '../utils/serverError'
import NotFoundError from '../utils/notFoundError'
import { VideoLinkBookingForm } from '../interfaces/whereaboutsApi/videoLinkBooking'
import { ApiAction, AuditService, Page, PostAction, SubjectType } from '../services/auditService'

const PRE_POST_APPOINTMENT_DURATION_MINS = 15

/**
 * Parse requests for appointments routes and orchestrate response
 */
export default class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly prisonerSearchService: PrisonerSearchService,
    private readonly auditService: AuditService,
  ) {}

  public displayAddAppointment(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const {
        clientToken,
        user: { activeCaseLoadId },
      } = res.locals
      const { prisonerNumber } = req.params
      const { firstName, lastName, bookingId, cellLocation, prisonId } = req.middleware.prisonerData
      const prisonerName = formatName(firstName, undefined, lastName, { style: NameFormatStyle.lastCommaFirst })

      const { appointmentTypes, locations } = await this.appointmentService.getAddAppointmentRefData(
        clientToken,
        activeCaseLoadId,
      )

      const now = new Date()
      const appointmentFlash = req.flash('appointmentForm')
      const formValues: AppointmentForm = appointmentFlash?.length
        ? (appointmentFlash[0] as never)
        : {
            bookingId,
            date: formatDate(now.toISOString(), 'short'),
          }
      const errors = req.flash('errors')

      await this.auditService.sendPageView({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: Page.AddAppointment,
      })

      return res.render('pages/appointments/addAppointment', {
        pageTitle: 'Add an appointment',
        miniBannerData: {
          prisonerName,
          prisonerNumber,
          cellLocation: formatLocation(cellLocation),
        },
        appointmentTypes: refDataToSelectOptions(appointmentTypes),
        locations: objectToSelectOptions(locations, 'locationId', 'userDescription'),
        repeatOptions,
        today: formatDate(now.toISOString(), 'short'),
        formValues,
        refererUrl: `/prisoner/${prisonerNumber}`,
        errors,
      })
    }
  }

  public post(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber } = req.params
      const userToken = res.locals.user.token

      const {
        appointmentType,
        location,
        date,
        startTimeHours,
        startTimeMinutes,
        endTimeHours,
        endTimeMinutes,
        recurring,
        repeats,
        times,
        comments,
        bookingId,
        refererUrl,
      } = req.body

      const appointmentForm: AppointmentForm = {
        appointmentType,
        location,
        date,
        startTimeHours,
        startTimeMinutes,
        endTimeHours,
        endTimeMinutes,
        recurring,
        repeats,
        times,
        comments,
        bookingId,
      }

      const errors = req.errors || []
      if (!errors.length) {
        const startTime = formatDateTimeISO(set(parseDate(date), { hours: startTimeHours, minutes: startTimeMinutes }))
        const endTime = formatDateTimeISO(set(parseDate(date), { hours: endTimeHours, minutes: endTimeMinutes }))

        const appointmentsToCreate: AppointmentDefaults = {
          bookingId,
          appointmentType,
          locationId: Number(location),
          startTime,
          endTime,
          comment: comments,
          repeat:
            recurring === 'yes'
              ? {
                  repeatPeriod: repeats,
                  count: times,
                }
              : undefined,
        }

        if (appointmentType === 'VLB') {
          req.flash('prePostAppointmentDetails', {
            appointmentDefaults: appointmentsToCreate,
            appointmentForm,
          })

          return res.redirect(`/prisoner/${prisonerNumber}/prepost-appointments`)
        }

        try {
          await this.appointmentService.createAppointments(userToken, appointmentsToCreate)
        } catch (error) {
          if (error.status === 400) {
            errors.push({ text: error.data.userMessage })
          } else throw error
        }
      }

      req.flash('appointmentForm', appointmentForm)

      if (errors.length) {
        req.flash('errors', errors)
        req.flash('refererUrl', refererUrl)
        return res.redirect(`/prisoner/${prisonerNumber}/add-appointment`)
      }

      await this.auditService.sendPostAttempt({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        prisonerNumber,
        correlationId: req.id,
        action: PostAction.Appointment,
        details: {},
      })

      return res.redirect(`/prisoner/${prisonerNumber}/appointment-confirmation`)
    }
  }

  public displayAppointmentConfirmation(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { prisonerNumber } = req.params
      const {
        clientToken,
        user: { activeCaseLoadId },
      } = res.locals
      const appointmentFlash = req.flash('appointmentForm')

      // Handle no appointment data in flash, e.g. users coming to confirmation page from a bookmarked link
      if (!appointmentFlash?.length) {
        return res.redirect(`/prisoner/${prisonerNumber}/schedule`)
      }

      const { appointmentTypes, locations } = await this.appointmentService.getAddAppointmentRefData(
        clientToken,
        activeCaseLoadId,
      )

      const { firstName, lastName, cellLocation, prisonId } = req.middleware.prisonerData
      const prisonerName = formatName(firstName, undefined, lastName, { style: NameFormatStyle.firstLast })
      const appointmentDetails: AppointmentForm = appointmentFlash[0] as never
      const heading = `${apostrophe(prisonerName)} ${pluralise(
        appointmentDetails.recurring === 'yes' ? +appointmentDetails.times : 1,
        'appointment has',
        {
          plural: 'appointments have',
          includeCount: false,
        },
      )} been added`

      const lastAppointmentISODate = formatDateISO(
        calculateEndDate(parseDate(appointmentDetails.date), appointmentDetails.repeats, appointmentDetails.times),
      )
      const lastAppointmentDate = formatDate(lastAppointmentISODate, 'long')
      const appointmentType = appointmentTypes.find(type => type.code === appointmentDetails.appointmentType)
        ?.description
      const location = locations.find(loc => loc.locationId === Number(appointmentDetails.location))?.userDescription
      const repeats = repeatOptions.find(type => type.value === appointmentDetails.repeats)?.text

      const appointmentData = {
        heading,
        prisonerName,
        prisonerNumber,
        appointmentType,
        location,
        date: formatDate(dateToIsoDate(appointmentDetails.date), 'long'),
        startTime: `${appointmentDetails.startTimeHours}:${appointmentDetails.startTimeMinutes}`,
        endTime: `${appointmentDetails.endTimeHours}:${appointmentDetails.endTimeMinutes}`,
        recurring: appointmentDetails.recurring,
        repeats,
        numberAdded: appointmentDetails.times,
        lastAppointmentDate,
        comment: appointmentDetails.comments,
      }

      // Save appointment details to session for movement slips to pick up if needed
      req.session.movementSlipData = {
        ...appointmentData,
        prisonerNumber,
        cellLocation: formatLocation(cellLocation),
        createdBy: res.locals.user.displayName,
      }

      await this.auditService.sendPageView({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: Page.AppointmentConfirmation,
      })

      return res.render('pages/appointments/appointmentConfirmation', {
        pageTitle: 'Appointment confirmation',
        ...appointmentData,
        addMoreUrl: `/prisoner/${prisonerNumber}/add-appointment`,
        profileUrl: `/prisoner/${prisonerNumber}`,
        movementSlipUrl: `/prisoner/${prisonerNumber}/movement-slips`,
      })
    }
  }

  public displayPrePostAppointments(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { prisonerNumber } = req.params
      const {
        clientToken,
        user: { activeCaseLoadId },
      } = res.locals
      const appointmentFlash = req.flash('prePostAppointmentDetails')
      // Handle no appointment data in flash, e.g. users coming to confirmation page from a bookmarked link
      if (!appointmentFlash?.length) {
        throw new ServerError('PrePostAppointmentDetails not found in request')
      }

      const { courts, locations } = await this.appointmentService.getPrePostAppointmentRefData(
        clientToken,
        activeCaseLoadId,
      )
      courts.push({ id: 'other', name: 'Other' })

      const { firstName, lastName, cellLocation, bookingId, prisonId } = req.middleware.prisonerData
      const prisonerName = formatName(firstName, undefined, lastName, { style: NameFormatStyle.lastCommaFirst })
      const { appointmentDefaults, appointmentForm, formValues } =
        appointmentFlash[0] as unknown as PrePostAppointmentDetails

      const location = locations.find(loc => loc.locationId === appointmentDefaults.locationId)?.userDescription

      const appointmentData = {
        bookingId,
        miniBannerData: {
          prisonerName,
          prisonerNumber,
          cellLocation: formatLocation(cellLocation),
        },
        location,
        date: appointmentForm.date,
        startTime: `${appointmentForm.startTimeHours}:${appointmentForm.startTimeMinutes}`,
        endTime: `${appointmentForm.endTimeHours}:${appointmentForm.endTimeMinutes}`,
        comments: appointmentForm.comments,
        appointmentDate: formatDate(appointmentDefaults.startTime, 'long'),
        formValues,
      }
      const errors = req.flash('errors')

      req.flash('postVLBDetails', { appointmentDefaults, appointmentForm, formValues })

      await this.auditService.sendPageView({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: Page.PrePostAppointments,
      })

      return res.render('pages/appointments/prePostAppointments', {
        pageTitle: 'Video link booking details',
        ...appointmentData,
        courts: objectToSelectOptions(courts, 'id', 'name'),
        locations: objectToSelectOptions(locations, 'locationId', 'userDescription'),
        refererUrl: `/prisoner/${prisonerNumber}`,
        errors,
      })
    }
  }

  public postVideoLinkBooking(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber } = req.params
      const userToken = res.locals.user.token

      const {
        bookingId,
        preAppointment,
        preAppointmentLocation,
        postAppointment,
        postAppointmentLocation,
        court,
        otherCourt,
      } = req.body
      const appointmentFlash = req.flash('postVLBDetails')
      if (!appointmentFlash?.length) {
        throw new ServerError('PostVideoLinkBooking: Appointment data not found in request')
      }
      const { appointmentDefaults, appointmentForm } = appointmentFlash[0] as unknown as PrePostAppointmentDetails

      const errors = req.errors || []
      if (!errors.length) {
        const preAppointmentStartTime = subMinutes(
          new Date(appointmentDefaults.startTime),
          PRE_POST_APPOINTMENT_DURATION_MINS,
        )
        const postAppointmentEndTime = addMinutes(
          new Date(appointmentDefaults.endTime),
          PRE_POST_APPOINTMENT_DURATION_MINS,
        )

        const videoLinkBookingForm: VideoLinkBookingForm = {
          bookingId,
          courtId: court,
          court: court === 'other' ? otherCourt : undefined,
          comment: appointmentDefaults.comment,
          madeByTheCourt: false,
          pre:
            preAppointment === 'yes'
              ? {
                  locationId: preAppointmentLocation,
                  startTime: formatDateTimeISO(preAppointmentStartTime),
                  endTime: appointmentDefaults.startTime,
                }
              : undefined,
          main: {
            locationId: appointmentDefaults.locationId,
            startTime: appointmentDefaults.startTime,
            endTime: appointmentDefaults.endTime,
          },
          post:
            postAppointment === 'yes'
              ? {
                  locationId: postAppointmentLocation,
                  startTime: appointmentDefaults.endTime,
                  endTime: formatDateTimeISO(postAppointmentEndTime),
                }
              : undefined,
        }

        try {
          await this.appointmentService.addVideoLinkBooking(userToken, videoLinkBookingForm)
        } catch (error) {
          if (error.status === 400) {
            errors.push({ text: error.data.userMessage })
          } else throw error
        }
      }

      req.flash('prePostAppointmentDetails', {
        appointmentDefaults,
        appointmentForm,
        formValues: {
          preAppointment,
          preAppointmentLocation,
          postAppointment,
          postAppointmentLocation,
          court,
          otherCourt,
        },
      })

      if (errors.length) {
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/prepost-appointments`)
      }

      await this.auditService.sendPostSuccess({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        prisonerNumber,
        correlationId: req.id,
        action: PostAction.Appointment,
        details: {},
      })

      return res.redirect(`/prisoner/${prisonerNumber}/prepost-appointment-confirmation`)
    }
  }

  public displayPrePostAppointmentConfirmation(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { prisonerNumber } = req.params
      const {
        clientToken,
        user: { activeCaseLoadId },
      } = res.locals

      const appointmentFlash = req.flash('prePostAppointmentDetails')
      if (!appointmentFlash?.length) {
        return new ServerError('PrePostAppointmentDetails not found in request')
      }
      const { appointmentDefaults, formValues } = appointmentFlash[0] as unknown as PrePostAppointmentDetails

      const { firstName, lastName, cellLocation, prisonId } = req.middleware.prisonerData
      const prisonerName = formatName(firstName, undefined, lastName, { style: NameFormatStyle.firstLast })

      const { courts, locations } = await this.appointmentService.getPrePostAppointmentRefData(
        clientToken,
        activeCaseLoadId,
      )
      const prison = await this.appointmentService.getAgencyDetails(clientToken, prisonId)

      const location = locations.find(loc => loc.locationId === Number(appointmentDefaults.locationId))?.userDescription
      const preLocation = locations.find(loc => loc.locationId === Number(formValues.preAppointmentLocation))
        ?.userDescription
      const postLocation = locations.find(loc => loc.locationId === Number(formValues.postAppointmentLocation))
        ?.userDescription
      const courtDescription = courts.find(court => court.id === formValues.court)?.name

      const preAppointmentStartTime = subMinutes(
        new Date(appointmentDefaults.startTime),
        PRE_POST_APPOINTMENT_DURATION_MINS,
      )
      const postAppointmentEndTime = addMinutes(
        new Date(appointmentDefaults.endTime),
        PRE_POST_APPOINTMENT_DURATION_MINS,
      )

      const appointmentData = {
        prisonerName,
        prisonerNumber,
        prisonName: prison.description,
        location,
        date: formatDate(appointmentDefaults.startTime, 'long'),
        startTime: timeFormat(appointmentDefaults.startTime),
        endTime: timeFormat(appointmentDefaults.endTime),
        comments: appointmentDefaults.comment,
        pre:
          formValues.preAppointment === 'yes'
            ? `${preLocation} - ${timeFormat(formatDateTimeISO(preAppointmentStartTime))} to ${timeFormat(
                appointmentDefaults.startTime,
              )}`
            : undefined,
        post:
          formValues.postAppointment === 'yes'
            ? `${postLocation} - ${timeFormat(appointmentDefaults.endTime)} to ${timeFormat(
                formatDateTimeISO(postAppointmentEndTime),
              )}`
            : undefined,
        court: formValues.court === 'other' ? formValues.otherCourt : courtDescription,
      }

      // Save appointment details to session for movement slips to pick up if needed
      req.session.movementSlipData = {
        ...appointmentData,
        appointmentType: 'Video Link Booking',
        comment: appointmentData.comments,
        prisonerNumber,
        cellLocation: formatLocation(cellLocation),
        createdBy: res.locals.user.displayName,
      }

      await this.auditService.sendPageView({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: Page.PrePostAppointmentConfirmation,
      })

      return res.render('pages/appointments/prePostAppointmentConfirmation', {
        pageTitle: 'Video link has been booked',
        ...appointmentData,
        profileUrl: `/prisoner/${prisonerNumber}`,
        movementSlipUrl: `/prisoner/${prisonerNumber}/movement-slips`,
      })
    }
  }

  public displayPrisonerMovementSlips(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const data = req.session.movementSlipData
      const { prisonerNumber, prisonId } = req.middleware.prisonerData
      if (!data) throw new NotFoundError('Movement slip data not found in session')

      res.locals = {
        ...res.locals,
        hideBackLink: true,
      }
      delete req.session.movementSlipData

      await this.auditService.sendPageView({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
        prisonerNumber,
        prisonId,
        correlationId: req.id,
        page: Page.PrePostAppointmentConfirmation,
      })

      return res.render('pages/appointments/movementSlips', {
        ...data,
      })
    }
  }

  /* JavaScript API route handlers ---------------------------------------------------------------------------------- */

  public getOffenderEvents(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        user: { activeCaseLoadId },
        clientToken,
      } = res.locals

      const isoDate = dateToIsoDate(req.query.date as string)
      const prisonerNumber = req.query.prisonerNumber as string

      const [prisonerData, events] = await Promise.all([
        this.prisonerSearchService.getPrisonerDetails(clientToken, prisonerNumber),
        this.appointmentService.getExistingEventsForOffender(clientToken, activeCaseLoadId, isoDate, prisonerNumber),
      ])

      this.auditService.sendEvent({
        who: res.locals.user.username,
        subjectId: prisonerNumber,
        correlationId: req.id,
        what: `API_${ApiAction.OffenderEvents}`,
        subjectType: SubjectType.PrisonerId,
      })

      return res.render('components/scheduledEvents/scheduledEvents.njk', {
        events,
        date: formatDate(isoDate, 'long'),
        prisonerName: formatName(prisonerData.firstName, null, prisonerData.lastName),
        type: 'offender',
      })
    }
  }

  public getLocationExistingEvents(): RequestHandler {
    return async (req: Request, res: Response) => {
      const {
        user: { activeCaseLoadId },
        clientToken,
      } = res.locals

      const isoDate = dateToIsoDate(req.query.date as string)
      const locationId = +req.query.locationId

      const [location, events] = await Promise.all([
        this.appointmentService.getLocation(clientToken, locationId),
        this.appointmentService.getExistingEventsForLocation(clientToken, activeCaseLoadId, locationId, isoDate),
      ])

      this.auditService.sendEvent({
        who: res.locals.user.username,
        subjectId: activeCaseLoadId,
        correlationId: req.id,
        what: `API_${ApiAction.LocationEvents}`,
        details: JSON.stringify({ locationId }),
      })

      return res.render('components/scheduledEvents/scheduledEvents.njk', {
        events,
        date: formatDate(isoDate, 'long'),
        header: `Schedule for ${location.userDescription}`,
        type: 'location',
      })
    }
  }

  public getRecurringEndDate(): RequestHandler {
    return async (req: Request, res: Response) => {
      const date = parseDate(req.query.date as string)
      const repeats = req.query.repeats as string
      const times = +req.query.times

      const endDate = formatDateISO(calculateEndDate(date, repeats, times))

      return res.send(formatDate(endDate, 'full').replace(',', ''))
    }
  }
}
