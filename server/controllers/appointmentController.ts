import { NextFunction, Request, RequestHandler, Response } from 'express'
import { addMinutes, set, subMinutes } from 'date-fns'
import { NotifyClient } from 'notifications-node-client'
import AppointmentService from '../services/appointmentService'
import {
  apostrophe,
  formatLocation,
  formatName,
  formatNamePart,
  objectToSelectOptions,
  refDataToSelectOptions,
} from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import {
  AppointmentDefaults,
  AppointmentForm,
  PrePostAppointmentDetails,
  repeatOptions,
} from '../data/interfaces/whereaboutsApi/Appointment'
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
import VideoLinkBookingForm from '../data/interfaces/whereaboutsApi/VideoLinkBookingForm'
import { ApiAction, AuditService, Page, PostAction, SubjectType } from '../services/auditService'
import config from '../config'
import logger from '../../logger'
import { PrisonUser } from '../interfaces/HmppsUser'
import CreateVideoBookingRequest from '../data/interfaces/bookAVideoLinkApi/CreateVideoBookingRequest'
import CourtLocation from '../data/interfaces/whereaboutsApi/CourtLocation'
import Court from '../data/interfaces/bookAVideoLinkApi/Court'
import VideoLinkLocation from '../data/interfaces/bookAVideoLinkApi/Location'
import Location from '../data/interfaces/prisonApi/Location'

const PRE_POST_APPOINTMENT_DURATION_MINS = 15
const { confirmBookingPrisonTemplateId, emails } = config.notifications

/**
 * Parse requests for appointments routes and orchestrate response
 */
export default class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly prisonerSearchService: PrisonerSearchService,
    private readonly auditService: AuditService,
    private readonly notifyClient: NotifyClient | { sendEmail(): void },
  ) {}

  public displayAddAppointment(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { clientToken } = req.middleware
      const { prisonerNumber } = req.params
      const { firstName, lastName, bookingId, cellLocation, prisonId } = req.middleware.prisonerData
      const prisonerName = formatName(firstName, undefined, lastName, { style: NameFormatStyle.lastCommaFirst })
      const user = res.locals.user as PrisonUser

      const { appointmentTypes, locations } = await this.appointmentService.getAddAppointmentRefData(
        clientToken,
        user.activeCaseLoadId,
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

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.AddAppointment,
        })
        .catch(error => logger.error(error))

      return res.render('pages/appointments/addAppointment', {
        pageTitle: 'Add an appointment',
        miniBannerData: {
          prisonerName,
          prisonerNumber,
          cellLocation: formatLocation(cellLocation),
        },
        appointmentTypes: refDataToSelectOptions(appointmentTypes),
        locations: objectToSelectOptions(locations, 'locationId', 'userDescription'),
        vlbLocations: config.featureToggles.bookAVideoLinkEnabled
          ? objectToSelectOptions(
              await this.appointmentService.getVideoLocations(clientToken, prisonId),
              'key',
              'description',
            )
          : [],
        repeatOptions,
        today: formatDate(now.toISOString(), 'short'),
        formValues,
        refererUrl: `/prisoner/${prisonerNumber}`,
        errors,
        bookAVideoLinkEnabled: config.featureToggles.bookAVideoLinkEnabled,
      })
    }
  }

  public post(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber } = req.params
      const { clientToken } = req.middleware

      const {
        appointmentType,
        location,
        vlbLocation,
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
        location: appointmentType === 'VLB' && config.featureToggles.bookAVideoLinkEnabled ? vlbLocation : location,
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
          await this.appointmentService.createAppointments(clientToken, appointmentsToCreate)
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

      this.auditService
        .sendPostAttempt({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.Appointment,
          details: {},
        })
        .catch(error => logger.error(error))

      return res.redirect(`/prisoner/${prisonerNumber}/appointment-confirmation`)
    }
  }

  public displayAppointmentConfirmation(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { prisonerNumber } = req.params
      const { clientToken } = req.middleware
      const user = res.locals.user as PrisonUser
      const appointmentFlash = req.flash('appointmentForm')

      // Handle no appointment data in flash, e.g. users coming to confirmation page from a bookmarked link
      if (!appointmentFlash?.length) {
        return res.redirect(`/prisoner/${prisonerNumber}/schedule`)
      }

      const { appointmentTypes, locations } = await this.appointmentService.getAddAppointmentRefData(
        clientToken,
        user.activeCaseLoadId,
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
      const appointmentType = appointmentTypes.find(
        type => type.code === appointmentDetails.appointmentType,
      )?.description
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

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.AppointmentConfirmation,
        })
        .catch(error => logger.error(error))

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
      const { clientToken } = req.middleware
      const user = res.locals.user as PrisonUser
      const appointmentFlash = req.flash('prePostAppointmentDetails')
      // Handle no appointment data in flash, e.g. users coming to confirmation page from a bookmarked link
      if (!appointmentFlash?.length) {
        throw new ServerError('PrePostAppointmentDetails not found in request')
      }

      const { courts, locations } = await this.appointmentService.getPrePostAppointmentRefData(
        clientToken,
        user.activeCaseLoadId,
      )

      if (!config.featureToggles.bookAVideoLinkEnabled) {
        ;(courts as CourtLocation[]).push({ id: 'other', name: 'Other' })
      }

      const { firstName, lastName, cellLocation, bookingId, prisonId } = req.middleware.prisonerData
      const prisonerName = formatName(firstName, undefined, lastName, { style: NameFormatStyle.lastCommaFirst })
      const { appointmentDefaults, appointmentForm, formValues } =
        appointmentFlash[0] as unknown as PrePostAppointmentDetails

      const location = config.featureToggles.bookAVideoLinkEnabled
        ? (locations as VideoLinkLocation[]).find(loc => loc.key === appointmentForm.location)?.description
        : (locations as Location[]).find(loc => loc.locationId === +appointmentDefaults.locationId)?.userDescription

      const hearingTypes = config.featureToggles.bookAVideoLinkEnabled
        ? objectToSelectOptions(await this.appointmentService.getCourtHearingTypes(clientToken), 'code', 'description')
        : []

      const appointmentData = {
        bookingId,
        prisonId,
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

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.PrePostAppointments,
        })
        .catch(error => logger.error(error))

      return res.render('pages/appointments/prePostAppointments', {
        pageTitle: 'Video link booking details',
        ...appointmentData,
        courts: config.featureToggles.bookAVideoLinkEnabled
          ? objectToSelectOptions(courts as Court[], 'code', 'description')
          : objectToSelectOptions(courts as CourtLocation[], 'id', 'name'),
        locations: config.featureToggles.bookAVideoLinkEnabled
          ? objectToSelectOptions(locations as VideoLinkLocation[], 'key', 'description')
          : objectToSelectOptions(locations as Location[], 'locationId', 'userDescription'),
        refererUrl: `/prisoner/${prisonerNumber}`,
        errors,
        bookAVideoLinkEnabled: config.featureToggles.bookAVideoLinkEnabled,
        hearingTypes,
      })
    }
  }

  public postVideoLinkBooking(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber } = req.params
      const { clientToken } = req.middleware

      const {
        bookingId,
        prisonId,
        preAppointment,
        preAppointmentLocation,
        postAppointment,
        postAppointmentLocation,
        court,
        otherCourt,
        hearingType,
        cvpRequired,
        videoLinkUrl,
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

        const videoLinkBookingForm = !config.featureToggles.bookAVideoLinkEnabled
          ? ({
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
                locationId: +appointmentDefaults.locationId,
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
            } as VideoLinkBookingForm)
          : ({
              bookingType: 'COURT',
              prisoners: [
                {
                  prisonCode: prisonId,
                  prisonerNumber,
                  appointments: [
                    preAppointment === 'yes'
                      ? {
                          type: 'VLB_COURT_PRE',
                          locationKey: preAppointmentLocation,
                          date: formatDateISO(parseDate(appointmentForm.date)),
                          startTime: timeFormat(formatDateTimeISO(preAppointmentStartTime)),
                          endTime: timeFormat(appointmentDefaults.startTime),
                        }
                      : undefined,
                    {
                      type: 'VLB_COURT_MAIN',
                      locationKey: appointmentForm.location,
                      date: formatDateISO(parseDate(appointmentForm.date)),
                      startTime: timeFormat(appointmentDefaults.startTime),
                      endTime: timeFormat(appointmentDefaults.endTime),
                    },
                    postAppointment === 'yes'
                      ? {
                          type: 'VLB_COURT_POST',
                          locationKey: postAppointmentLocation,
                          date: formatDateISO(parseDate(appointmentForm.date)),
                          startTime: timeFormat(appointmentDefaults.endTime),
                          endTime: timeFormat(formatDateTimeISO(postAppointmentEndTime)),
                        }
                      : undefined,
                  ].filter(Boolean),
                },
              ],
              courtCode: court,
              courtHearingType: hearingType,
              comments: appointmentDefaults.comment.trim() || undefined,
              videoLinkUrl: videoLinkUrl.trim() || undefined,
            } as CreateVideoBookingRequest)

        try {
          await this.appointmentService.addVideoLinkBooking(clientToken, videoLinkBookingForm)
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
          hearingType,
          cvpRequired,
          videoLinkUrl,
        },
      })

      if (errors.length) {
        req.flash('errors', errors)
        return res.redirect(`/prisoner/${prisonerNumber}/prepost-appointments`)
      }

      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.Appointment,
          details: {},
        })
        .catch(error => logger.error(error))

      return res.redirect(`/prisoner/${prisonerNumber}/prepost-appointment-confirmation`)
    }
  }

  public displayPrePostAppointmentConfirmation(): RequestHandler {
    return async (req: Request, res: Response, next: NextFunction) => {
      const { prisonerNumber } = req.params
      const { clientToken } = req.middleware
      const user = res.locals.user as PrisonUser
      const { activeCaseLoadId, username } = user

      const appointmentFlash = req.flash('prePostAppointmentDetails')
      if (!appointmentFlash?.length) {
        return new ServerError('PrePostAppointmentDetails not found in request')
      }
      const { appointmentDefaults, appointmentForm, formValues } =
        appointmentFlash[0] as unknown as PrePostAppointmentDetails

      const { firstName, lastName, cellLocation, prisonId } = req.middleware.prisonerData
      const prisonerName = formatName(firstName, undefined, lastName, { style: NameFormatStyle.firstLast })

      const [{ courts, locations }, prison, userEmailData] = await Promise.all([
        this.appointmentService.getPrePostAppointmentRefData(clientToken, activeCaseLoadId),
        this.appointmentService.getAgencyDetails(clientToken, prisonId),
        this.appointmentService.getUserEmail(clientToken, username),
      ])

      const location = config.featureToggles.bookAVideoLinkEnabled
        ? (locations as VideoLinkLocation[]).find(loc => loc.key === appointmentForm.location)?.description
        : (locations as Location[]).find(loc => loc.locationId === +appointmentDefaults.locationId)?.userDescription

      const preLocation = config.featureToggles.bookAVideoLinkEnabled
        ? (locations as VideoLinkLocation[]).find(loc => loc.key === formValues.preAppointmentLocation)?.description
        : (locations as Location[]).find(loc => loc.locationId === +formValues.preAppointmentLocation)?.userDescription

      const postLocation = config.featureToggles.bookAVideoLinkEnabled
        ? (locations as VideoLinkLocation[]).find(loc => loc.key === formValues.postAppointmentLocation)?.description
        : (locations as Location[]).find(loc => loc.locationId === +formValues.postAppointmentLocation)?.userDescription

      const courtDescription = config.featureToggles.bookAVideoLinkEnabled
        ? (courts as Court[]).find(court => court.code === formValues.court)?.description
        : (courts as CourtLocation[]).find(court => court.id === formValues.court)?.name

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
        hearingType: config.featureToggles.bookAVideoLinkEnabled
          ? await this.appointmentService
              .getCourtHearingTypes(clientToken)
              .then(r => r.find(ht => ht.code === formValues.hearingType).description)
          : undefined,
        videoLinkUrl: formValues.videoLinkUrl,
        bookAVideoLinkEnabled: config.featureToggles.bookAVideoLinkEnabled,
        mustContactTheCourt:
          config.featureToggles.bookAVideoLinkEnabled &&
          !(courts as Court[]).find(court => court.code === formValues.court)?.enabled,
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

      // Send confirmation email
      if (userEmailData && userEmailData.email) {
        const personalisation = {
          startTime: appointmentData.startTime,
          endTime: appointmentData.endTime,
          comments: appointmentData.comments || 'None entered.',
          firstName: formatNamePart(firstName),
          lastName: formatNamePart(lastName),
          offenderNo: appointmentData.prisonerNumber,
          prison: appointmentData.prisonName,
          date: appointmentData.date,
          location: appointmentData.location,
          preAppointmentInfo: appointmentData.pre || 'None requested',
          postAppointmentInfo: appointmentData.post || 'None requested',
          court: appointmentData.court,
        }

        try {
          await this.notifyClient.sendEmail(confirmBookingPrisonTemplateId, userEmailData.email, {
            personalisation,
            reference: null,
          })

          if (getOmuEmailFor(activeCaseLoadId)) {
            await this.notifyClient.sendEmail(confirmBookingPrisonTemplateId, getOmuEmailFor(activeCaseLoadId), {
              personalisation,
              reference: null,
            })
          }
        } catch (error) {
          logger.error(`Failed to send email via Notify: ${error.response.status} - ${error.response.statusText}`)
        }
      }

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.PrePostAppointmentConfirmation,
        })
        .catch(error => logger.error(error))

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

      this.auditService
        .sendPageView({
          user: res.locals.user,
          prisonerNumber,
          prisonId,
          correlationId: req.id,
          page: Page.PrePostAppointmentConfirmation,
        })
        .catch(error => logger.error(error))

      return res.render('pages/appointments/movementSlips', {
        ...data,
      })
    }
  }

  /* JavaScript API route handlers ---------------------------------------------------------------------------------- */

  public getOffenderEvents(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { clientToken } = req.middleware
      const user = res.locals.user as PrisonUser

      const isoDate = dateToIsoDate(req.query.date as string)
      const prisonerNumber = req.query.prisonerNumber as string

      const [prisonerData, events] = await Promise.all([
        this.prisonerSearchService.getPrisonerDetails(clientToken, prisonerNumber),
        this.appointmentService.getExistingEventsForOffender(
          clientToken,
          user.activeCaseLoadId,
          isoDate,
          prisonerNumber,
        ),
      ])

      this.auditService
        .sendEvent({
          who: res.locals.user.username,
          subjectId: prisonerNumber,
          correlationId: req.id,
          what: `API_${ApiAction.OffenderEvents}`,
          subjectType: SubjectType.PrisonerId,
        })
        .catch(error => logger.error(error))

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
      const { clientToken } = req.middleware
      const user = res.locals.user as PrisonUser

      const isoDate = dateToIsoDate(req.query.date as string)
      const locationId = +req.query.locationId
      const locationKey = req.query.locationKey as string

      const location = locationId
        ? await this.appointmentService.getLocation(clientToken, locationId)
        : await this.appointmentService.getLocationByKey(clientToken, locationKey)

      const events = await this.appointmentService.getExistingEventsForLocation(
        clientToken,
        user.activeCaseLoadId,
        location.locationId,
        isoDate,
      )

      this.auditService
        .sendEvent({
          who: res.locals.user.username,
          subjectId: user.activeCaseLoadId,
          correlationId: req.id,
          what: `API_${ApiAction.LocationEvents}`,
          details: JSON.stringify({ locationId }),
        })
        .catch(error => logger.error(error))

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

      return res.send(formatDate(endDate, 'full'))
    }
  }
}

function getOmuEmailFor(establishment: string) {
  const establishmentEmails = emails[establishment as keyof typeof emails]
  return establishmentEmails && establishmentEmails.omu
}
