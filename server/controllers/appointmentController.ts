import { Request, RequestHandler } from 'express'
import { addMinutes, set, subMinutes } from 'date-fns'
import { UUID } from 'crypto'
import AppointmentService from '../services/appointmentService'
import {
  apostrophe,
  formatLocation,
  mapToQueryString,
  objectToRadioOptions,
  objectToSelectOptions,
  refDataToSelectOptions,
} from '../utils/utils'
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
import { pluralise } from '../utils/pluralise'
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
import getCommonRequestData from '../utils/getCommonRequestData'
import { errorHasStatus } from '../utils/errorHelpers'
import EphemeralDataService from '../services/ephemeralDataService'

const PRE_POST_APPOINTMENT_DURATION_MINS = 15

/**
 * Parse requests for appointments routes and orchestrate response
 */
export default class AppointmentController {
  constructor(
    readonly appointmentService: AppointmentService,
    private readonly locationDetailsService: LocationDetailsService,
    private readonly ephemeralDataService: EphemeralDataService,
    private readonly auditService: AuditService,
  ) {}

  public displayAddAppointment(): RequestHandler {
    const buildAppointmentForm = async (
      clientToken: string,
      bookingId: number,
      prisonId: string,
      appointmentFromFlash: string[],
      appointment: AppointmentDetails,
    ): Promise<AppointmentForm> => {
      if (appointmentFromFlash?.length) {
        return appointmentFromFlash[0] as AppointmentForm
      }

      if (!appointment) {
        return {
          bookingId,
          prisonId,
          date: formatDate(new Date().toISOString(), 'short'),
        }
      }

      const appointmentForm = {
        appointmentId: appointment.appointment.id,
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
        prisonId,
      } as AppointmentForm
      if (
        appointment.appointment.appointmentTypeCode === 'VLB' ||
        appointment.appointment.appointmentTypeCode === 'VLPM'
      ) {
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
          probationTeam: vlb.probationTeamCode || undefined,
          officerDetailsNotKnown:
            vlb.bookingType === 'PROBATION' && vlb.additionalBookingDetails?.contactName === undefined
              ? 'true'
              : undefined,
          officerFullName: (vlb.bookingType === 'PROBATION' && vlb.additionalBookingDetails?.contactName) || undefined,
          officerEmail: (vlb.bookingType === 'PROBATION' && vlb.additionalBookingDetails?.contactEmail) || undefined,
          officerTelephone:
            (vlb.bookingType === 'PROBATION' && vlb.additionalBookingDetails?.contactNumber) || undefined,
          meetingType: vlb.probationMeetingType || undefined,
          notesForStaff: vlb.notesForStaff || undefined,
          notesForPrisoners: vlb.notesForPrisoners || undefined,
        }
      }

      return appointmentForm
    }

    return async (req, res) => {
      const { appointmentId } = req.params
      const { clientToken, miniBannerData } = getCommonRequestData(req, res)
      const { prisonerNumber } = req.params
      const { bookingId, prisonId } = req.middleware.prisonerData
      const user = res.locals.user as PrisonUser

      const appointment = appointmentId
        ? await this.appointmentService.getAppointment(clientToken, +appointmentId)
        : null

      const { appointmentTypes, probationTeams, meetingTypes, locations } =
        await this.appointmentService.getAddAppointmentRefData(clientToken, user.activeCaseLoadId)

      const appointmentFlash = req.flash('appointmentForm')
      const formValues: AppointmentForm = await buildAppointmentForm(
        clientToken,
        bookingId,
        prisonId,
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
        miniBannerData,
        appointmentTypes: refDataToSelectOptions(appointmentTypes),
        probationTeams: objectToSelectOptions(probationTeams, 'code', 'description'),
        meetingTypes: objectToRadioOptions(meetingTypes, 'code', 'description'),
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
    return async (req, res) => {
      const { prisonerNumber } = req.params
      const { clientToken } = req.middleware

      const {
        appointmentId,
        appointmentType,
        probationTeam,
        location,
        officerDetailsNotKnown,
        officerFullName,
        officerEmail,
        officerTelephone,
        meetingType,
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
        prisonId,
        refererUrl,
        notesForStaff,
        notesForPrisoners,
      } = req.body

      const appointmentForm: AppointmentForm = {
        appointmentId: appointmentId ? +appointmentId : undefined,
        appointmentType,
        probationTeam,
        location,
        officerDetailsNotKnown,
        officerFullName,
        officerEmail,
        officerTelephone: officerTelephone || undefined,
        meetingType,
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
        prisonId,
        notesForStaff,
        notesForPrisoners,
      }

      const errors = req.errors || []
      if (!errors.length) {
        const startTime = formatDateTimeISO(set(parseDate(date), { hours: startTimeHours, minutes: startTimeMinutes }))
        const endTime = formatDateTimeISO(set(parseDate(date), { hours: endTimeHours, minutes: endTimeMinutes }))

        // Non-bvl locations are identified via UUID/integer. BVL locations are identified via location.key
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
          const cacheId = await this.ephemeralDataService.cacheData({
            appointmentDefaults: appointmentsToCreate,
            appointmentForm,
          })
          const queryString = mapToQueryString({ appointmentData: cacheId })

          return appointmentId
            ? res.redirect(`/prisoner/${prisonerNumber}/edit-prepost-appointments/${appointmentId}?${queryString}`)
            : res.redirect(`/prisoner/${prisonerNumber}/prepost-appointments?${queryString}`)
        }

        try {
          await this.createOrAmendAppointments(clientToken, prisonerNumber, appointmentsToCreate, appointmentForm)
        } catch (error) {
          if (errorHasStatus(error, 400)) {
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
    return async (req, res) => {
      const { prisonerNumber } = req.params
      const { clientToken } = req.middleware
      const user = res.locals.user as PrisonUser
      const appointmentFlash = req.flash('appointmentForm')

      // Handle no appointment data in flash, e.g. users coming to confirmation page from a bookmarked link
      if (!appointmentFlash?.length) {
        return res.redirect(`/prisoner/${prisonerNumber}/schedule`)
      }

      const { appointmentTypes, locations, probationTeams, meetingTypes } =
        await this.appointmentService.getAddAppointmentRefData(clientToken, user.activeCaseLoadId)

      const { cellLocation, prisonId } = req.middleware.prisonerData
      const prisonerName = res.locals.prisonerName?.firstLast
      const appointmentDetails: AppointmentForm = appointmentFlash[0] as never
      const heading = `${apostrophe(prisonerName)} ${pluralise(
        appointmentDetails.recurring === 'yes' ? +appointmentDetails.times : 1,
        'appointment has',
        {
          plural: 'appointments have',
          includeCount: false,
        },
      )} been ${appointmentDetails.appointmentId ? 'updated' : 'added'}`

      const lastAppointmentISODate = formatDateISO(
        calculateEndDate(parseDate(appointmentDetails.date), appointmentDetails.repeats, appointmentDetails.times),
      )

      const appointmentData = {
        heading,
        prisonerName,
        prisonerNumber,
        appointmentTypeCode: appointmentDetails.appointmentType,
        appointmentType: appointmentTypes.find(type => type.code === appointmentDetails.appointmentType)?.description,
        probationTeam: probationTeams.find(team => team.code === appointmentDetails.probationTeam)?.description,
        location: locations.find(loc => loc.id === appointmentDetails.location)?.localName,
        officerDetailsNotKnown: appointmentDetails.officerDetailsNotKnown,
        officerFullName: appointmentDetails.officerFullName,
        officerEmail: appointmentDetails.officerEmail,
        officerTelephone: appointmentDetails.officerTelephone,
        meetingType: meetingTypes.find(ht => ht.code === appointmentDetails.meetingType)?.description,
        date: formatDate(dateToIsoDate(appointmentDetails.date), 'long'),
        startTime: `${appointmentDetails.startTimeHours}:${appointmentDetails.startTimeMinutes}`,
        endTime: `${appointmentDetails.endTimeHours}:${appointmentDetails.endTimeMinutes}`,
        recurring: appointmentDetails.recurring,
        repeats: repeatOptions.find(type => type.value === appointmentDetails.repeats)?.text,
        numberAdded: appointmentDetails.times,
        lastAppointmentDate: formatDate(lastAppointmentISODate, 'long'),
        comment: appointmentDetails.comments,
        notesForStaff: appointmentDetails.notesForStaff,
        notesForPrisoners: appointmentDetails.notesForPrisoners,
      }

      // Save appointment details to session for movement slips to pick up if needed
      req.session.movementSlipData = {
        ...appointmentData,
        prisonerNumber,
        prisonerName,
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
      appointmentFromCache: PrePostAppointmentDetails,
      appointment: AppointmentDetails,
    ): Promise<PrePostAppointmentDetails> => {
      const { appointmentDefaults, appointmentForm, formValues } = appointmentFromCache

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
              bookingType: undefined as string,
              preAppointment: preAppointment ? 'yes' : 'no',
              preAppointmentLocation: preLocation,
              postAppointment: postAppointment ? 'yes' : 'no',
              postAppointmentLocation: postLocation,
              court: vlb.courtCode,
              hearingType: vlb.courtHearingType,
              cvpRequired: vlb.videoLinkUrl || vlb.hmctsNumber ? 'yes' : 'no',
              videoLinkUrl: vlb.videoLinkUrl,
              hmctsNumber: vlb.hmctsNumber,
              guestPinRequired: vlb.guestPin ? 'yes' : 'no',
              guestPin: vlb.guestPin,
            }
          })
        : undefined

      return { appointmentDefaults, appointmentForm, formValues: formValuesFromAppointment }
    }

    return async (req, res) => {
      const { appointmentId } = req.params
      const { appointmentData: cacheId } = req.query
      const { clientToken, prisonerNumber, prisonId, miniBannerData } = getCommonRequestData(req, res)
      const user = res.locals.user as PrisonUser
      const cachedAppointmentData = await this.ephemeralDataService.getData<PrePostAppointmentDetails>(cacheId as UUID)

      // Handle no appointment data in cache, e.g. users coming to confirmation page from a bookmarked link
      if (!cachedAppointmentData?.value) {
        logger.info(`PrePostAppointmentDetails not found in cache. Redirecting to add appointment page.`)
        return res.redirect(`/prisoner/${prisonerNumber}/add-appointment`)
      }

      // Get the list values for courts, hearings, and locations
      const { courts, hearingTypes, locations } = await this.appointmentService.getPrePostAppointmentRefData(
        clientToken,
        user.activeCaseLoadId,
      )

      // If editing, get the existing appointment into context
      const appointment = appointmentId
        ? await this.appointmentService.getAppointment(clientToken, +appointmentId)
        : null

      // Build the form details - either from flash provider for a new booking, or from APIs when editing
      const { appointmentDefaults, appointmentForm, formValues } = await buildPrePostAppointmentDetails(
        clientToken,
        cachedAppointmentData.value,
        appointment,
      )

      // Map the NOMIS location ids to DPS UUID
      let location
      if (appointmentDefaults.locationId) {
        const { dpsLocationId } = await this.locationDetailsService.getLocationMappingUsingNomisLocationId(
          clientToken,
          appointmentDefaults.locationId,
        )
        location = locations.find(loc => loc.id === dpsLocationId)?.localName
      }

      // Build up an object for the appointment
      const appointmentData = {
        miniBannerData,
        location,
        date: appointmentForm.date,
        startTime: `${appointmentForm.startTimeHours}:${appointmentForm.startTimeMinutes}`,
        endTime: `${appointmentForm.endTimeHours}:${appointmentForm.endTimeMinutes}`,
        comments: appointmentForm.comments,
        appointmentDate: formatDate(appointmentDefaults.startTime, 'long'),
        notesForStaff: appointmentForm.notesForStaff,
        notesForPrisoners: appointmentForm.notesForPrisoners,
        formValues,
      }

      const errors = req.flash('errors')

      // If redirected here from a submission error we need to clear down any cached appointments data
      // as it may contain values from a previously failed post in this session. So we overwrite the cached data.
      await this.ephemeralDataService.cacheData({ appointmentDefaults, appointmentForm, formValues }, cacheId as UUID)

      // Audit the access to the pre-post appointments form
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
        locations: objectToSelectOptions(locations, 'id', 'localName'),
        refererUrl: `/prisoner/${prisonerNumber}`,
        errors,
        hearingTypes: objectToSelectOptions(hearingTypes, 'code', 'description'),
        appointmentId,
        cacheId,
      })
    }
  }

  public postVideoLinkBooking(): RequestHandler {
    return async (req, res) => {
      const { prisonerNumber, appointmentId } = req.params
      const { clientToken } = req.middleware

      const {
        bookingType,
        preAppointment,
        preAppointmentLocation,
        postAppointment,
        postAppointmentLocation,
        court,
        hearingType,
        cvpRequired,
        videoLinkUrl,
        hmctsNumber,
        guestPinRequired,
        guestPin,
        cacheId,
      } = req.body

      // Use the values cached from the previous page
      const cachedAppointmentData = await this.ephemeralDataService.getData<PrePostAppointmentDetails>(cacheId as UUID)
      if (!cachedAppointmentData?.value) {
        logger.info(`PostVideoLinkBooking data not found in cache. Redirecting to add appointment page.`)
        return res.redirect(`/prisoner/${prisonerNumber}/add-appointment`)
      }

      const { appointmentDefaults, appointmentForm } = cachedAppointmentData.value

      const prePostAppointmentDetails = {
        appointmentId: +appointmentId,
        appointmentDefaults,
        appointmentForm,
        formValues: {
          bookingType,
          preAppointment,
          preAppointmentLocation,
          postAppointment,
          postAppointmentLocation,
          court,
          hearingType,
          cvpRequired,
          videoLinkUrl,
          hmctsNumber,
          guestPinRequired,
          guestPin,
        },
      }

      // If there are no form errors create or amend the booking with these values
      const errors = req.errors || []
      if (!errors.length) {
        try {
          await this.createOrAmendAppointments(
            clientToken,
            prisonerNumber,
            appointmentDefaults,
            appointmentForm,
            prePostAppointmentDetails,
          )
        } catch (error) {
          if (errorHasStatus(error, 400)) {
            errors.push({ text: error.data.userMessage })
          } else {
            throw error
          }
        }
      }

      const queryString = mapToQueryString({ appointmentData: cacheId as UUID })

      if (errors.length) {
        req.flash('errors', errors)
        return appointmentId
          ? res.redirect(`/prisoner/${prisonerNumber}/edit-prepost-appointments/${appointmentId}?${queryString}`)
          : res.redirect(`/prisoner/${prisonerNumber}/prepost-appointments?${queryString}`)
      }

      // Overwrite the cache with the latest details before proceeding to the next page
      await this.ephemeralDataService.cacheData(prePostAppointmentDetails, cacheId as UUID)

      this.auditService
        .sendPostSuccess({
          user: res.locals.user,
          prisonerNumber,
          correlationId: req.id,
          action: PostAction.Appointment,
          details: {},
        })
        .catch(error => logger.error(error))

      return res.redirect(`/prisoner/${prisonerNumber}/prepost-appointment-confirmation?${queryString}`)
    }
  }

  public displayPrePostAppointmentConfirmation(): RequestHandler {
    return async (req, res) => {
      const { prisonerNumber } = req.params
      const prisonerName = res.locals.prisonerName?.firstLast
      const { appointmentData: cacheId } = req.query
      const { clientToken } = req.middleware
      const user = res.locals.user as PrisonUser
      const { activeCaseLoadId } = user

      const cachedAppointmentData = await this.ephemeralDataService.getData<PrePostAppointmentDetails>(cacheId as UUID)
      if (!cachedAppointmentData?.value) {
        logger.info(`PrePostAppointmentDetails not found in cache. Redirecting to add appointment page.`)
        return res.redirect(`/prisoner/${prisonerNumber}/add-appointment`)
      }
      const { appointmentId, appointmentDefaults, formValues, appointmentForm } = cachedAppointmentData.value

      const { cellLocation, prisonId } = req.middleware.prisonerData

      const [{ courts, hearingTypes, locations }, prison] = await Promise.all([
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
        bookingType: formValues.bookingType,
        appointmentTypeCode: 'VLB',
        appointmentType: 'Video Link - Court Hearing',
        prisonName: prison.description,
        location,
        date: formatDate(appointmentDefaults.startTime, 'long'),
        startTime: timeFormat(appointmentDefaults.startTime),
        endTime: timeFormat(appointmentDefaults.endTime),
        comments: appointmentDefaults.comment,
        notesForStaff: appointmentForm.notesForStaff,
        notesForPrisoners: appointmentForm.notesForPrisoners,
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
        hearingType: hearingTypes.find(ht => ht.code === formValues.hearingType)?.description,
        videoLinkUrl:
          formValues.cvpRequired === 'yes' && formValues.videoLinkUrl && formValues.videoLinkUrl.length > 0
            ? formValues.videoLinkUrl
            : undefined,
        hmctsNumber:
          formValues.cvpRequired === 'yes' && formValues.hmctsNumber && formValues.hmctsNumber.length > 0
            ? formValues.hmctsNumber
            : undefined,
        guestPin:
          formValues.guestPinRequired === 'yes' && formValues.guestPin && formValues.guestPin.length > 0
            ? formValues.guestPin
            : undefined,
        mustContactTheCourt: courts.find(court => court.code === formValues.court)?.enabled === false,
      }

      // Save appointment details to session for movement slips to pick up if needed
      req.session.movementSlipData = {
        ...appointmentData,
        comment: appointmentData.comments,
        prisonerNumber,
        prisonerName,
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
    return async (req, res) => {
      const { prisonerNumber, prisonId } = req.middleware.prisonerData
      const data = req.session.movementSlipData
      if (!data) {
        throw new NotFoundError('Movement slip data not found in session')
      }

      res.locals = { ...res.locals, hideBackLink: true }
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

      return res.render('pages/appointments/movementSlips', { ...data })
    }
  }

  /* JavaScript API route handlers ---------------------------------------------------------------------------------- */

  public getOffenderEvents(): RequestHandler {
    return async (req, res) => {
      const { clientToken } = req.middleware
      const user = res.locals.user as PrisonUser

      const isoDate = dateToIsoDate(req.query.date as string)
      const prisonerNumber = req.query.prisonerNumber as string
      const { appointmentId } = req.query

      const prisonerEventsPromise = this.appointmentService.getExistingEventsForOffender(
        clientToken,
        user.activeCaseLoadId,
        isoDate,
        prisonerNumber,
      )

      const appointmentPromise = appointmentId
        ? this.appointmentService
            .getAppointment(clientToken, +appointmentId)
            .then(appointment => this.fetchSeparateAppointmentsIfVlb(clientToken, appointment))
        : Promise.resolve([])

      const [events, appointments] = await Promise.all([prisonerEventsPromise, appointmentPromise])

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
        type: 'offender',
      })
    }
  }

  public getLocationExistingEvents(): RequestHandler {
    return async (req, res) => {
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
    return async (req, res) => {
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

  private createOrAmendAppointments = async (
    token: string,
    prisonerNumber: string,
    appointments: AppointmentDefaults,
    appointmentForm: AppointmentForm,
    prePostAppointmentForm?: PrePostAppointmentDetails,
  ) => {
    if (appointmentForm.appointmentType !== 'VLB' && appointmentForm.appointmentType !== 'VLPM') {
      return this.appointmentService.createAppointments(token, appointments)
    }

    const preAppointmentStartTime = subMinutes(new Date(appointments.startTime), PRE_POST_APPOINTMENT_DURATION_MINS)
    const postAppointmentEndTime = addMinutes(new Date(appointments.endTime), PRE_POST_APPOINTMENT_DURATION_MINS)

    const [preLocation, mainLocation, postLocation] = await Promise.all([
      prePostAppointmentForm?.formValues?.preAppointmentLocation
        ? this.locationDetailsService.getLocation(token, prePostAppointmentForm?.formValues?.preAppointmentLocation)
        : undefined,
      this.locationDetailsService.getLocation(token, appointmentForm.location),
      prePostAppointmentForm?.formValues?.postAppointmentLocation
        ? this.locationDetailsService.getLocation(token, prePostAppointmentForm?.formValues?.postAppointmentLocation)
        : undefined,
    ])

    const mainAppointmentType = appointmentForm.appointmentType === 'VLB' ? 'VLB_COURT_MAIN' : 'VLB_PROBATION'
    const bookingType = appointmentForm.appointmentType === 'VLB' ? 'COURT' : 'PROBATION'

    const videoLinkBookingForm = {
      bookingType,
      prisoners: [
        {
          prisonCode: appointmentForm.prisonId,
          prisonerNumber,
          appointments: [
            prePostAppointmentForm?.formValues.preAppointment === 'yes'
              ? {
                  type: 'VLB_COURT_PRE',
                  locationKey: preLocation.key,
                  date: formatDateISO(parseDate(appointmentForm.date)),
                  startTime: timeFormat(formatDateTimeISO(preAppointmentStartTime)),
                  endTime: timeFormat(appointments.startTime),
                }
              : undefined,
            {
              type: mainAppointmentType,
              locationKey: mainLocation.key,
              date: formatDateISO(parseDate(appointmentForm.date)),
              startTime: timeFormat(appointments.startTime),
              endTime: timeFormat(appointments.endTime),
            },
            prePostAppointmentForm?.formValues?.postAppointment === 'yes'
              ? {
                  type: 'VLB_COURT_POST',
                  locationKey: postLocation.key,
                  date: formatDateISO(parseDate(appointmentForm.date)),
                  startTime: timeFormat(appointments.endTime),
                  endTime: timeFormat(formatDateTimeISO(postAppointmentEndTime)),
                }
              : undefined,
          ].filter(Boolean),
        },
      ],
      courtCode: prePostAppointmentForm?.formValues?.court,
      probationTeamCode: appointmentForm.probationTeam,
      courtHearingType: prePostAppointmentForm?.formValues?.hearingType,
      probationMeetingType: appointmentForm.meetingType || undefined,
      videoLinkUrl:
        prePostAppointmentForm?.formValues?.cvpRequired === 'yes' &&
        prePostAppointmentForm.formValues?.videoLinkUrl &&
        prePostAppointmentForm.formValues.videoLinkUrl.length > 0
          ? prePostAppointmentForm.formValues.videoLinkUrl
          : undefined,
      hmctsNumber:
        prePostAppointmentForm?.formValues?.cvpRequired === 'yes' &&
        prePostAppointmentForm.formValues?.hmctsNumber &&
        prePostAppointmentForm.formValues.hmctsNumber.length > 0
          ? prePostAppointmentForm.formValues.hmctsNumber
          : undefined,
      guestPin:
        prePostAppointmentForm?.formValues?.guestPinRequired === 'yes' &&
        prePostAppointmentForm.formValues.guestPin &&
        prePostAppointmentForm.formValues.guestPin?.length > 0
          ? prePostAppointmentForm.formValues.guestPin
          : undefined,
      additionalBookingDetails:
        appointmentForm.appointmentType === 'VLPM' && !appointmentForm.officerDetailsNotKnown
          ? {
              contactName: appointmentForm.officerFullName,
              contactEmail: appointmentForm.officerEmail,
              contactNumber: appointmentForm.officerTelephone,
            }
          : undefined,
      notesForStaff: appointmentForm.notesForStaff || undefined,
      notesForPrisoners: appointmentForm.notesForPrisoners || undefined,
    } as CreateVideoBookingRequest

    if (appointmentForm.appointmentId) {
      const appointment = await this.appointmentService.getAppointment(token, appointmentForm.appointmentId)
      const vlb = await this.getVideoLinkBookingFromAppointment(token, appointment)
      return this.appointmentService.amendVideoLinkBooking(
        token,
        vlb.videoLinkBookingId,
        videoLinkBookingForm as AmendVideoBookingRequest,
      )
    }
    return this.appointmentService.addVideoLinkBooking(token, videoLinkBookingForm)
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

  private clearStoredFlashMessages = (req: Request, flash: string) => {
    const checkFlashDetails = req.flash(flash)
    if (checkFlashDetails && checkFlashDetails.length > 0) {
      logger.info(`Cleared stale flash entry for ${flash}`)
    }
  }
}
