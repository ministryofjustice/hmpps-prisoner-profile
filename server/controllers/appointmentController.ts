import { NextFunction, Request, RequestHandler, Response } from 'express'
import { addMinutes, set, subMinutes } from 'date-fns'
import AppointmentService from '../services/appointmentService'
import { apostrophe, formatLocation, formatName, objectToSelectOptions, refDataToSelectOptions } from '../utils/utils'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import {
  AppointmentDefaults,
  AppointmentDetails,
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
  formatDateToPattern,
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
import LocationDetailsService from '../services/locationDetailsService'
import CreateVideoBookingRequest, {
  AmendVideoBookingRequest,
  VideoLinkBooking,
} from '../data/interfaces/bookAVideoLinkApi/VideoLinkBooking'
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
    const buildAppointmentForm = async (
      clientToken: string,
      bookingId: number,
      appointmentFromFlash: string[],
      appointment: AppointmentDetails,
    ): Promise<AppointmentForm> => {
      if (appointmentFromFlash?.length) {
        return appointmentFromFlash[0] as AppointmentForm
      }

      if (!appointment) {
        return {
          bookingId,
          date: formatDate(new Date().toISOString(), 'short'),
        }
      }

      const appointmentForm = {
        appointmentType: appointment.appointment.appointmentTypeCode,
        location: (
          await this.locationDetailsService.getLocationMappingUsingNomisLocationId(
            clientToken,
            appointment.appointment.locationId,
          )
        ).dpsLocationId,
        date: formatDate(appointment.appointment.startTime, 'short'),
        startTimeHours: formatDateToPattern(appointment.appointment.startTime, 'HH'),
        startTimeMinutes: formatDateToPattern(appointment.appointment.startTime, 'mm'),
        endTimeHours: formatDateToPattern(appointment.appointment.endTime, 'HH'),
        endTimeMinutes: formatDateToPattern(appointment.appointment.endTime, 'mm'),
        recurring: appointment.recurring ? 'yes' : 'no',
        repeats: appointment.recurring?.repeatPeriod,
        times: appointment.recurring?.count,
        comments: appointment.appointment.comment,
        bookingId,
      } as AppointmentForm

      if (appointment.appointment.appointmentTypeCode === 'VLB') {
        const vlb = await this.getVideoLinkBookingFromAppointment(clientToken, appointment)
        const { mainAppointment } = this.extractPrisonAppointmentsFromBooking(vlb)

        return {
          ...appointmentForm,
          location: await this.mapLocationKeyToId(clientToken, mainAppointment.prisonLocKey),
          date: formatDate(mainAppointment.appointmentDate, 'short'),
          startTimeHours: mainAppointment.startTime.split(':')[0],
          startTimeMinutes: mainAppointment.startTime.split(':')[1],
          endTimeHours: mainAppointment.endTime.split(':')[0],
          endTimeMinutes: mainAppointment.endTime.split(':')[1],
        }
      }

      return appointmentForm
    }

    return async (req: Request, res: Response, next: NextFunction) => {
      const { appointmentId } = req.params
      const { clientToken } = req.middleware
      const { prisonerNumber } = req.params
      const { firstName, lastName, bookingId, cellLocation, prisonId } = req.middleware.prisonerData
      const prisonerName = formatName(firstName, undefined, lastName, { style: NameFormatStyle.lastCommaFirst })
      const user = res.locals.user as PrisonUser

      const appointment = appointmentId
        ? await this.appointmentService.getAppointment(clientToken, +appointmentId)
        : null

      const { appointmentTypes, locations } = await this.appointmentService.getAddAppointmentRefData(
        clientToken,
        user.activeCaseLoadId,
      )

      const appointmentFlash = req.flash('appointmentForm')
      const formValues: AppointmentForm = await buildAppointmentForm(
        clientToken,
        bookingId,
        appointmentFlash,
        appointment,
      )
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
        pageTitle: appointmentId ? 'Change appointment details' : 'Add an appointment',
        miniBannerData: {
          prisonerName,
          prisonerNumber,
          cellLocation: formatLocation(cellLocation),
        },
        appointmentTypes: refDataToSelectOptions(appointmentTypes),
        locations: objectToSelectOptions(locations, 'id', 'localName'),
        repeatOptions,
        today: formatDate(new Date().toISOString(), 'short'),
        formValues,
        refererUrl: `/prisoner/${prisonerNumber}`,
        errors,
        appointmentId,
      })
    }
  }

  public post(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber, appointmentId } = req.params
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

          return appointmentId
            ? res.redirect(`/prisoner/${prisonerNumber}/edit-prepost-appointments/${appointmentId}`)
            : res.redirect(`/prisoner/${prisonerNumber}/prepost-appointments`)
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
        return appointmentId
          ? res.redirect(`/prisoner/${prisonerNumber}/edit-appointment/${appointmentId}`)
          : res.redirect(`/prisoner/${prisonerNumber}/add-appointment`)
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
    const buildPrePostAppointmentDetails = async (
      clientToken: string,
      appointmentFromFlash: string[],
      appointment: AppointmentDetails,
    ): Promise<PrePostAppointmentDetails> => {
      const { appointmentDefaults, appointmentForm, formValues } =
        appointmentFromFlash[0] as unknown as PrePostAppointmentDetails

      if (formValues) {
        return { appointmentDefaults, appointmentForm, formValues }
      }

      const formValuesFromAppointment = appointment
        ? await this.getVideoLinkBookingFromAppointment(clientToken, appointment).then(async vlb => {
            const { preAppointment, postAppointment } = this.extractPrisonAppointmentsFromBooking(vlb)

            const [preLocation, postLocation] = await Promise.all([
              preAppointment ? this.mapLocationKeyToId(clientToken, preAppointment.prisonLocKey) : undefined,
              postAppointment ? this.mapLocationKeyToId(clientToken, postAppointment.prisonLocKey) : undefined,
            ])

            return {
              bookingType: vlb.bookingType,
              preAppointment: preAppointment ? 'yes' : 'no',
              preAppointmentLocation: preLocation,
              postAppointment: postAppointment ? 'yes' : 'no',
              postAppointmentLocation: postLocation,
              court: vlb.courtCode,
              probationTeam: vlb.probationTeamCode,
              hearingType: vlb.courtHearingType,
              meetingType: vlb.probationMeetingType,
              cvpRequired: vlb.videoLinkUrl ? 'yes' : 'no',
              videoLinkUrl: vlb.videoLinkUrl,
            }
          })
        : undefined

      return { appointmentDefaults, appointmentForm, formValues: formValuesFromAppointment }
    }

    return async (req: Request, res: Response, next: NextFunction) => {
      const { prisonerNumber, appointmentId } = req.params
      const { clientToken } = req.middleware
      const user = res.locals.user as PrisonUser
      const appointmentFlash = req.flash('prePostAppointmentDetails')
      // Handle no appointment data in flash, e.g. users coming to confirmation page from a bookmarked link
      if (!appointmentFlash?.length) {
        throw new ServerError('PrePostAppointmentDetails not found in request')
      }

      const { courts, probationTeams, locations } = await this.appointmentService.getPrePostAppointmentRefData(
        clientToken,
        user.activeCaseLoadId,
      )

      const { firstName, lastName, cellLocation, prisonId } = req.middleware.prisonerData
      const prisonerName = formatName(firstName, undefined, lastName, { style: NameFormatStyle.lastCommaFirst })

      const appointment = appointmentId
        ? await this.appointmentService.getAppointment(clientToken, +appointmentId)
        : null

      const { appointmentDefaults, appointmentForm, formValues } = await buildPrePostAppointmentDetails(
        clientToken,
        appointmentFlash,
        appointment,
      )

      let location
      if (appointmentDefaults.locationId) {
        const { dpsLocationId } = await this.locationDetailsService.getLocationMappingUsingNomisLocationId(
          clientToken,
          appointmentDefaults.locationId,
        )
        location = locations.find(loc => loc.id === dpsLocationId)?.localName
      }

      const hearingTypes = objectToSelectOptions(
        await this.appointmentService.getCourtHearingTypes(clientToken),
        'code',
        'description',
      )
      const meetingTypes = objectToSelectOptions(
        await this.appointmentService.getProbationMeetingTypes(clientToken),
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
        pageTitle: appointmentId ? 'Change appointment details' : 'Video link booking details',
        ...appointmentData,
        courts: objectToSelectOptions(courts, 'code', 'description'),
        probationTeams: objectToSelectOptions(probationTeams, 'code', 'description'),
        locations: objectToSelectOptions(locations, 'id', 'localName'),
        refererUrl: `/prisoner/${prisonerNumber}`,
        errors,
        hearingTypes,
        meetingTypes,
        appointmentId,
      })
    }
  }

  public postVideoLinkBooking(): RequestHandler {
    return async (req: Request, res: Response) => {
      const { prisonerNumber, appointmentId } = req.params
      const { clientToken } = req.middleware

      const {
        bookingType,
        prisonId,
        preAppointment,
        preAppointmentLocation,
        postAppointment,
        postAppointmentLocation,
        court,
        probationTeam,
        hearingType,
        meetingType,
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
            ? this.locationDetailsService.getLocation(clientToken, preAppointmentLocation)
            : undefined,
          this.locationDetailsService.getLocation(clientToken, appointmentForm.location),
          postAppointmentLocation
            ? this.locationDetailsService.getLocation(clientToken, postAppointmentLocation)
            : undefined,
        ])

        const videoLinkBookingForm = {
          bookingType,
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
                  type: bookingType === 'COURT' ? 'VLB_COURT_MAIN' : 'VLB_PROBATION',
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
          probationTeamCode: probationTeam,
          courtHearingType: hearingType,
          probationMeetingType: meetingType,
          comments: appointmentDefaults.comment.trim() || undefined,
          videoLinkUrl: (cvpRequired === 'yes' && videoLinkUrl?.trim()) || undefined,
        } as CreateVideoBookingRequest

        try {
          if (appointmentId) {
            const appointment = await this.appointmentService.getAppointment(clientToken, +appointmentId)
            const vlb = await this.getVideoLinkBookingFromAppointment(clientToken, appointment)
            await this.appointmentService.amendVideoLinkBooking(
              clientToken,
              vlb.videoLinkBookingId,
              videoLinkBookingForm as AmendVideoBookingRequest,
            )
          } else await this.appointmentService.addVideoLinkBooking(clientToken, videoLinkBookingForm)
        } catch (error) {
          if (error.status === 400) {
            errors.push({ text: error.data.userMessage })
          } else throw error
        }
      }

      req.flash('prePostAppointmentDetails', {
        appointmentId,
        appointmentDefaults,
        appointmentForm,
        formValues: {
          bookingType,
          preAppointment,
          preAppointmentLocation,
          postAppointment,
          postAppointmentLocation,
          court,
          probationTeam,
          hearingType,
          meetingType,
          cvpRequired,
          videoLinkUrl,
        },
      })

      if (errors.length) {
        req.flash('errors', errors)
        return appointmentId
          ? res.redirect(`/prisoner/${prisonerNumber}/edit-prepost-appointments/${appointmentId}`)
          : res.redirect(`/prisoner/${prisonerNumber}/prepost-appointments`)
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
    return async (req: Request, res: Response) => {
      const { prisonerNumber } = req.params
      const { clientToken } = req.middleware
      const user = res.locals.user as PrisonUser
      const { activeCaseLoadId } = user

      const appointmentFlash = req.flash('prePostAppointmentDetails')
      if (!appointmentFlash?.length) {
        throw new ServerError('PrePostAppointmentDetails not found in request')
      }
      const { appointmentId, appointmentDefaults, formValues } =
        appointmentFlash[0] as unknown as PrePostAppointmentDetails

      const { firstName, lastName, cellLocation, prisonId } = req.middleware.prisonerData
      const prisonerName = formatName(firstName, undefined, lastName, { style: NameFormatStyle.firstLast })

      const [{ courts, probationTeams, locations }, prison] = await Promise.all([
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
      const probationTeamDescription = probationTeams.find(team => team.code === formValues.probationTeam)?.description

      const preAppointmentStartTime = subMinutes(
        new Date(appointmentDefaults.startTime),
        PRE_POST_APPOINTMENT_DURATION_MINS,
      )
      const postAppointmentEndTime = addMinutes(
        new Date(appointmentDefaults.endTime),
        PRE_POST_APPOINTMENT_DURATION_MINS,
      )

      const appointmentData = {
        bookingType: formValues.bookingType,
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
        probationTeam: probationTeamDescription,
        hearingType: await this.appointmentService
          .getCourtHearingTypes(clientToken)
          .then(r => r.find(ht => ht.code === formValues.hearingType)?.description),
        meetingType: await this.appointmentService
          .getProbationMeetingTypes(clientToken)
          .then(r => r.find(ht => ht.code === formValues.meetingType)?.description),
        videoLinkUrl: formValues.cvpRequired === 'yes' && formValues.videoLinkUrl,
        mustContactTheCourt:
          courts.find(court => court.code === formValues.court)?.enabled === false ||
          probationTeams.find(team => team.code === formValues.probationTeam)?.enabled === false,
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
        pageTitle: appointmentId ? 'The video link has been updated' : 'The video link has been booked',
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
      const { appointmentId } = req.query

      const prisonerAndEventsPromise = Promise.all([
        this.prisonerSearchService.getPrisonerDetails(clientToken, prisonerNumber),
        this.appointmentService.getExistingEventsForOffender(
          clientToken,
          user.activeCaseLoadId,
          isoDate,
          prisonerNumber,
        ),
      ])

      const appointmentPromise = appointmentId
        ? this.appointmentService
            .getAppointment(clientToken, +appointmentId)
            .then(appointment => this.fetchSeparateAppointmentsIfVlb(clientToken, appointment))
        : Promise.resolve([])

      const [[prisonerData, events], appointments] = await Promise.all([prisonerAndEventsPromise, appointmentPromise])

      this.auditService
        .sendEvent({
          who: res.locals.user.username,
          subjectId: prisonerNumber,
          correlationId: req.id,
          what: `API_${ApiAction.OffenderEvents}`,
          subjectType: SubjectType.PrisonerId,
        })
        .catch(error => logger.error(error))

      const filteredEvents = events.filter(
        e =>
          !appointments.some(
            a =>
              a.offenderNo === e.offenderNo &&
              a.location === +e.locationId &&
              a.startTime === e.startTime &&
              a.endTime === e.endTime,
          ),
      )

      return res.render('components/scheduledEvents/scheduledEvents.njk', {
        events: filteredEvents,
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
      const { locationId, appointmentId } = req.query

      const { nomisLocationId } = await this.locationDetailsService.getLocationMappingUsingDpsLocationId(
        clientToken,
        locationId as string,
      )

      const locationAndEventsPromise = Promise.all([
        this.locationDetailsService.getLocation(clientToken, locationId as string),
        this.appointmentService.getExistingEventsForLocation(
          clientToken,
          user.activeCaseLoadId,
          nomisLocationId,
          isoDate,
        ),
      ])

      const appointmentPromise = appointmentId
        ? this.appointmentService
            .getAppointment(clientToken, +appointmentId)
            .then(appointment => this.fetchSeparateAppointmentsIfVlb(clientToken, appointment))
        : Promise.resolve([])

      const [[location, events], appointments] = await Promise.all([locationAndEventsPromise, appointmentPromise])

      this.auditService
        .sendEvent({
          who: user.username,
          subjectId: user.activeCaseLoadId,
          correlationId: req.id,
          what: `API_${ApiAction.LocationEvents}`,
          details: JSON.stringify({ locationId }),
        })
        .catch(error => logger.error(error))

      const filteredEvents = events.filter(
        e =>
          !appointments.some(
            a =>
              a.offenderNo === e.offenderNo &&
              a.location === +e.locationId &&
              a.startTime === e.startTime &&
              a.endTime === e.endTime,
          ),
      )

      return res.render('components/scheduledEvents/scheduledEvents.njk', {
        events: filteredEvents,
        date: formatDate(isoDate, 'long'),
        header: `Schedule for ${location.localName}`,
        type: 'location',
      })
    }
  }

  private async fetchSeparateAppointmentsIfVlb(clientToken: string, appointment: AppointmentDetails) {
    if (appointment.appointment.appointmentTypeCode === 'VLB') {
      const vlb = await this.getVideoLinkBookingFromAppointment(clientToken, appointment)
      const { preAppointment, mainAppointment, postAppointment } = this.extractPrisonAppointmentsFromBooking(vlb)

      const mappedAppointments = await Promise.all(
        [preAppointment, mainAppointment, postAppointment].map(async appt => {
          if (!appt) return undefined
          const locationMapping = await this.locationDetailsService.getLocationMappingUsingDpsLocationKey(
            clientToken,
            appt.prisonLocKey,
          )
          return {
            offenderNo: appt.prisonerNumber,
            location: locationMapping.nomisLocationId,
            startTime: appt.startTime,
            endTime: appt.endTime,
          }
        }),
      )

      return mappedAppointments.filter(Boolean) // Remove undefined entries
    }

    return [
      {
        offenderNo: appointment.appointment.offenderNo,
        location: appointment.appointment.locationId,
        startTime: formatDateToPattern(appointment.appointment.startTime, 'HH:mm'),
        endTime: formatDateToPattern(appointment.appointment.endTime, 'HH:mm'),
      },
    ]
  }

  public getRecurringEndDate(): RequestHandler {
    return async (req: Request, res: Response) => {
      const date = parseDate(req.query.date as string)
      const repeats = req.query.repeats as string
      const times = +req.query.times

      const endDate = formatDateISO(calculateEndDate(date, repeats, times))

      res.send(formatDate(endDate, 'full'))
    }
  }

  private getVideoLinkBookingFromAppointment = async (clientToken: string, appointment: AppointmentDetails) => {
    const app = appointment.appointment
    return this.appointmentService.getVideoLinkBooking(clientToken, {
      prisonerNumber: app.offenderNo,
      locationKey: (await this.locationDetailsService.getLocationByNomisLocationId(clientToken, app.locationId)).key,
      date: formatDateToPattern(app.startTime, 'yyyy-MM-dd'),
      startTime: formatDateToPattern(app.startTime, 'HH:mm'),
      endTime: formatDateToPattern(app.endTime, 'HH:mm'),
    })
  }

  private mapLocationKeyToId = async (clientToken: string, prisonLocKey: string) =>
    (await this.locationDetailsService.getLocationByKey(clientToken, prisonLocKey)).id

  private extractPrisonAppointmentsFromBooking = (booking: VideoLinkBooking) => {
    const getAppointment = (type: string) => booking.prisonAppointments.find(a => a.appointmentType === type)

    return {
      preAppointment: getAppointment('VLB_COURT_PRE'),
      mainAppointment: getAppointment('VLB_COURT_MAIN') || getAppointment('VLB_PROBATION'),
      postAppointment: getAppointment('VLB_COURT_POST'),
    }
  }
}
