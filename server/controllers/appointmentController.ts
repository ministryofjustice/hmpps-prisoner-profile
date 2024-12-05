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
import { ApiAction, AuditService, Page, PostAction, SubjectType } from '../services/auditService'
import logger from '../../logger'
import { PrisonUser } from '../interfaces/HmppsUser'
import CreateVideoBookingRequest from '../data/interfaces/bookAVideoLinkApi/CreateVideoBookingRequest'
import LocationDetailsService from '../services/locationDetailsService'
import LocationsApiLocation from '../data/interfaces/locationsInsidePrisonApi/LocationsApiLocation'
import NomisSyncLocation from '../data/interfaces/nomisSyncPrisonerMappingApi/NomisSyncLocation'

const PRE_POST_APPOINTMENT_DURATION_MINS = 15

/**
 * Parse requests for appointments routes and orchestrate response
 */
export default class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly prisonerSearchService: PrisonerSearchService,
    private readonly auditService: AuditService,
    private readonly locationDetailsService: LocationDetailsService,
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
        locations: objectToSelectOptions(locations, 'id', 'localName'),
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
      const { clientToken } = req.middleware

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
        // non-bvl locations ideintified via UUID/integer form id.  BVL locations identified via key
        let nomisLocationId
        if (location) {
          const result = await this.locationDetailsService.getLocationMappingUsingDpsLocationId(clientToken, location)
          nomisLocationId = result.nomisLocationId
        }
        const appointmentsToCreate: AppointmentDefaults = {
          bookingId,
          appointmentType,
          locationId: nomisLocationId || 0,
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
      const location = locations.find(loc => loc.id === appointmentDetails.location)?.localName
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

      const { firstName, lastName, cellLocation, prisonId } = req.middleware.prisonerData
      const prisonerName = formatName(firstName, undefined, lastName, { style: NameFormatStyle.lastCommaFirst })
      const { appointmentDefaults, appointmentForm, formValues } =
        appointmentFlash[0] as unknown as PrePostAppointmentDetails

      let locationMap = {} as NomisSyncLocation
      if (appointmentDefaults.locationId) {
        locationMap = await this.locationDetailsService.getLocationMappingUsingNomisLocationId(
          clientToken,
          appointmentDefaults.locationId,
        )
      }

      const location = (locations as LocationsApiLocation[]).find(
        loc => loc.id === locationMap.dpsLocationId,
      )?.localName

      const hearingTypes = objectToSelectOptions(
        await this.appointmentService.getCourtHearingTypes(clientToken),
        'code',
        'description',
      )

      const appointmentData = {
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
        courts: objectToSelectOptions(courts, 'code', 'description'),
        locations: objectToSelectOptions(locations, 'id', 'localName'),
        refererUrl: `/prisoner/${prisonerNumber}`,
        errors,
        hearingTypes,
      })
    }
  }

  public postVideoLinkBooking(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber } = req.params
      const { clientToken } = req.middleware

      const {
        prisonId,
        preAppointment,
        preAppointmentLocation,
        postAppointment,
        postAppointmentLocation,
        court,
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

        const [preLocation, mainLocation, postLocation] = await Promise.all([
          preAppointmentLocation
            ? this.locationDetailsService.getLocationMappingUsingNomisLocationId(clientToken, +preAppointmentLocation)
            : undefined,
          this.locationDetailsService.getLocationMappingUsingNomisLocationId(clientToken, +appointmentForm.location),
          postAppointmentLocation
            ? this.locationDetailsService.getLocationMappingUsingNomisLocationId(clientToken, +postAppointmentLocation)
            : undefined,
        ])

        const videoLinkBookingForm = {
          bookingType: 'COURT',
          prisoners: [
            {
              prisonCode: prisonId,
              prisonerNumber,
              appointments: [
                preAppointment === 'yes'
                  ? {
                      type: 'VLB_COURT_PRE',
                      locationKey: preLocation.key,
                      date: formatDateISO(parseDate(appointmentForm.date)),
                      startTime: timeFormat(formatDateTimeISO(preAppointmentStartTime)),
                      endTime: timeFormat(appointmentDefaults.startTime),
                    }
                  : undefined,
                {
                  type: 'VLB_COURT_MAIN',
                  locationKey: mainLocation.key,
                  date: formatDateISO(parseDate(appointmentForm.date)),
                  startTime: timeFormat(appointmentDefaults.startTime),
                  endTime: timeFormat(appointmentDefaults.endTime),
                },
                postAppointment === 'yes'
                  ? {
                      type: 'VLB_COURT_POST',
                      locationKey: postLocation.key,
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
        } as CreateVideoBookingRequest

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
      const { activeCaseLoadId } = user

      const appointmentFlash = req.flash('prePostAppointmentDetails')
      if (!appointmentFlash?.length) {
        return new ServerError('PrePostAppointmentDetails not found in request')
      }
      const { appointmentDefaults, formValues } = appointmentFlash[0] as unknown as PrePostAppointmentDetails

      const { firstName, lastName, cellLocation, prisonId } = req.middleware.prisonerData
      const prisonerName = formatName(firstName, undefined, lastName, { style: NameFormatStyle.firstLast })

      const [{ courts, locations }, prison] = await Promise.all([
        this.appointmentService.getPrePostAppointmentRefData(clientToken, activeCaseLoadId),
        this.appointmentService.getAgencyDetails(clientToken, prisonId),
      ])

      let apptDefaultsLocationMap = {} as NomisSyncLocation
      if (appointmentDefaults.locationId) {
        apptDefaultsLocationMap = await this.locationDetailsService.getLocationMappingUsingNomisLocationId(
          clientToken,
          appointmentDefaults.locationId,
        )
      }

      const location = locations.find(loc => loc.id === apptDefaultsLocationMap.dpsLocationId)?.localName

      const preLocation = locations.find(loc => loc.id === formValues.preAppointmentLocation)?.localName

      const postLocation = locations.find(loc => loc.id === formValues.postAppointmentLocation)?.localName

      const courtDescription = courts.find(court => court.code === formValues.court)?.description

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
        court: courtDescription,
        hearingType: await this.appointmentService
          .getCourtHearingTypes(clientToken)
          .then(r => r.find(ht => ht.code === formValues.hearingType).description),
        videoLinkUrl: formValues.videoLinkUrl,
        mustContactTheCourt: !courts.find(court => court.code === formValues.court)?.enabled,
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
      // eslint-disable-next-line prefer-destructuring
      const locationId = req.query.locationId

      const { nomisLocationId } = await this.locationDetailsService.getLocationMappingUsingDpsLocationId(
        clientToken,
        locationId as string,
      )

      const [location, events] = await Promise.all([
        this.locationDetailsService.getLocation(clientToken, locationId as string),
        this.appointmentService.getExistingEventsForLocation(
          clientToken,
          user.activeCaseLoadId,
          nomisLocationId,
          isoDate,
        ),
      ])
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
        header: `Schedule for ${location.localName}`,
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
