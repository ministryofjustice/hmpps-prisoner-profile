import { addDays, addMinutes, set, subMinutes } from 'date-fns'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import PrisonerSearchService from '../services/prisonerSearch'
import AppointmentService from '../services/appointmentService'
import AppointmentController from './appointmentController'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { repeatOptions } from '../data/interfaces/whereaboutsApi/Appointment'
import { dateToIsoDate, formatDate, formatDateTimeISO, parseDate } from '../utils/dateHelpers'
import { appointmentTypesMock, appointmentTypesSelectOptionsMock } from '../data/localMockData/appointmentTypesMock'
import { locationsMock, locationsSelectOptionsMock } from '../data/localMockData/locationsMock'
import HmppsError from '../interfaces/HmppsError'
import { formatLocation, formatName } from '../utils/utils'
import { courtLocationsMock, courtLocationsSelectOptionsMock } from '../data/localMockData/courtLocationsMock'
import VideoLinkBookingForm from '../data/interfaces/whereaboutsApi/VideoLinkBookingForm'
import AgenciesMock from '../data/localMockData/agenciesDetails'
import { offenderEventsMock } from '../data/localMockData/offenderEventsMock'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { notifyClient } from '../utils/notifyClient'
import { userEmailDataMock } from '../data/localMockData/userEmailDataMock'
import { HmppsUser } from '../interfaces/HmppsUser'

let req: any
let res: any
let controller: any

const user: Partial<HmppsUser> = {
  displayName: 'A Name',
  userRoles: [Role.PrisonUser],
  staffId: 487023,
  caseLoads: CaseLoadsDummyDataA,
  token: 'USER_TOKEN',
  activeCaseLoadId: 'MDI',
}

const today = formatDateTimeISO(new Date(), { startOfDay: true })

const formBody = {
  appointmentType: appointmentTypesSelectOptionsMock[0].value,
  location: locationsSelectOptionsMock[0].value as number,
  date: formatDate(today, 'short'),
  startTimeHours: 23,
  startTimeMinutes: 15,
  endTimeHours: 23,
  endTimeMinutes: 30,
  recurring: 'yes',
  repeats: 'DAILY',
  times: 2,
  comments: 'Comment',
  bookingId: PrisonerMockDataA.bookingId,
}

const appointmentsToCreate = {
  bookingId: formBody.bookingId,
  appointmentType: formBody.appointmentType,
  locationId: formBody.location,
  startTime: formatDateTimeISO(
    set(parseDate(formBody.date), { hours: formBody.startTimeHours, minutes: formBody.startTimeMinutes }),
  ),
  endTime: formatDateTimeISO(
    set(parseDate(formBody.date), { hours: formBody.endTimeHours, minutes: formBody.endTimeMinutes }),
  ),
  comment: formBody.comments,
  repeat: {
    repeatPeriod: formBody.repeats,
    count: formBody.times,
  },
}

const formBodyVLB = {
  bookingId: PrisonerMockDataA.bookingId,
  preAppointment: 'yes',
  preAppointmentLocation: locationsMock[0].locationId,
  postAppointment: 'yes',
  postAppointmentLocation: locationsMock[1].locationId,
  court: courtLocationsMock[0].id,
}

const videoLinkBookingForm: VideoLinkBookingForm = {
  bookingId: formBodyVLB.bookingId,
  courtId: formBodyVLB.court,
  court: undefined,
  comment: formBody.comments,
  madeByTheCourt: false,
  pre: {
    locationId: formBodyVLB.preAppointmentLocation,
    startTime: formatDateTimeISO(subMinutes(new Date(appointmentsToCreate.startTime), 15)),
    endTime: appointmentsToCreate.startTime,
  },
  main: {
    locationId: formBody.location,
    startTime: appointmentsToCreate.startTime,
    endTime: appointmentsToCreate.endTime,
  },
  post: {
    locationId: formBodyVLB.postAppointmentLocation,
    startTime: appointmentsToCreate.endTime,
    endTime: formatDateTimeISO(addMinutes(new Date(appointmentsToCreate.endTime), 15)),
  },
}

jest.mock('../services/prisonerSearch.ts')
jest.mock('../services/appointmentService.ts')

describe('Appointments Controller', () => {
  const appointmentService: AppointmentService = new AppointmentService(
    null,
    null,
    null,
  ) as jest.Mocked<AppointmentService>
  const prisonerSearchService: PrisonerSearchService = new PrisonerSearchService(
    null,
  ) as jest.Mocked<PrisonerSearchService>

  beforeEach(() => {
    jest.resetAllMocks()

    req = {
      params: { prisonerNumber: PrisonerMockDataA.prisonerNumber },
      body: {},
      query: {},
      path: 'appointments',
      session: {},
      middleware: {
        clientToken: 'CLIENT_TOKEN',
        prisonerData: PrisonerMockDataA,
      },
      flash: jest.fn(),
    }
    res = {
      locals: { user },
      render: jest.fn(),
      send: jest.fn(),
      redirect: jest.fn(),
    }

    const notifyClientMock = notifyClient
    notifyClientMock.sendEmail = jest.fn()

    controller = new AppointmentController(
      appointmentService,
      prisonerSearchService,
      auditServiceMock(),
      notifyClientMock,
    )

    appointmentService.getAddAppointmentRefData = jest.fn(async () => ({
      appointmentTypes: appointmentTypesMock,
      locations: locationsMock,
    }))
    appointmentService.getPrePostAppointmentRefData = jest.fn(async () => ({
      courts: courtLocationsMock,
      locations: locationsMock,
    }))
    appointmentService.getAgencyDetails = jest.fn(async () => AgenciesMock)
    appointmentService.getLocation = jest.fn(async () => locationsMock[0])
    appointmentService.getExistingEventsForOffender = jest.fn(async () => offenderEventsMock)
    appointmentService.getExistingEventsForLocation = jest.fn(async () => offenderEventsMock)
    appointmentService.getUserEmail = jest.fn(async () => userEmailDataMock)
    prisonerSearchService.getPrisonerDetails = jest.fn(async () => PrisonerMockDataA)
  })

  it('should display add appointment', async () => {
    await controller.displayAddAppointment()(req, res)

    expect(controller['appointmentService'].getAddAppointmentRefData).toHaveBeenCalledWith(
      req.middleware.clientToken,
      res.locals.user.activeCaseLoadId,
    )

    expect(res.render).toHaveBeenCalledWith('pages/appointments/addAppointment', {
      pageTitle: 'Add an appointment',
      miniBannerData: {
        prisonerName: 'Saunders, John',
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        cellLocation: PrisonerMockDataA.cellLocation,
      },
      appointmentTypes: appointmentTypesSelectOptionsMock,
      locations: locationsSelectOptionsMock,
      repeatOptions,
      today: formBody.date,
      formValues: {
        bookingId: 1102484,
        date: formBody.date,
      },
      refererUrl: `/prisoner/${PrisonerMockDataA.prisonerNumber}`,
      errors: undefined,
    })
  })

  describe('POST', () => {
    beforeEach(() => {
      req.body = {
        ...formBody,
        refererUrl: 'http://referer',
      }
    })
    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should create new appointment', async () => {
      await controller.post()(req, res)

      expect(controller['appointmentService'].createAppointments).toHaveBeenCalledWith(
        res.locals.user.token,
        appointmentsToCreate,
      )

      expect(req.flash).toHaveBeenCalledWith('appointmentForm', formBody)
      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${PrisonerMockDataA.prisonerNumber}/appointment-confirmation`,
      )
    })

    it('should redirect to VLB page', async () => {
      req.body = {
        ...formBody,
        appointmentType: 'VLB',
        refererUrl: 'http://referer',
      }

      await controller.post()(req, res)

      expect(controller['appointmentService'].createAppointments).not.toHaveBeenCalled()

      expect(req.flash).toHaveBeenCalledWith('prePostAppointmentDetails', {
        appointmentDefaults: { ...appointmentsToCreate, appointmentType: 'VLB' },
        appointmentForm: { ...formBody, appointmentType: 'VLB' },
      })
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${PrisonerMockDataA.prisonerNumber}/prepost-appointments`)
    })

    it('should redirect back to form if errors', async () => {
      const errors: HmppsError[] = [
        {
          text: 'Error',
          href: '#error',
        },
      ]

      req.body.refererUrl = 'http://referer'
      req.errors = errors

      await controller.post()(req, res)

      expect(controller['appointmentService'].createAppointments).not.toHaveBeenCalled()

      expect(req.flash).toHaveBeenCalledWith('errors', errors)
      expect(req.flash).toHaveBeenCalledWith('refererUrl', 'http://referer')
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${PrisonerMockDataA.prisonerNumber}/add-appointment`)
    })

    it('should call Notify with the correct data', async () => {
      const flash = {
        appointmentDefaults: {
          startTime: appointmentsToCreate.startTime,
          endTime: appointmentsToCreate.endTime,
          locationId: appointmentsToCreate.locationId,
          comment: appointmentsToCreate.comment,
        },
        formValues: formBodyVLB,
      }
      req.flash = (key: string) => {
        if (key === 'prePostAppointmentDetails') {
          return [flash]
        }
        return []
      }

      await controller.displayPrePostAppointmentConfirmation()(req, res)

      expect(controller['notifyClient'].sendEmail).toHaveBeenCalledWith(
        '391bb0e0-89b3-4aef-b11e-c6550b71fee8',
        'jsmith@email.com',
        {
          personalisation: expect.objectContaining({
            comments: 'Comment',
            court: 'Leeds Court',
            endTime: '23:30',
            firstName: 'John',
            lastName: 'Saunders',
            location: 'CES',
            offenderNo: 'G6123VU',
            postAppointmentInfo: 'Chapel - 23:30 to 23:45',
            preAppointmentInfo: 'CES - 23:00 to 23:15',
            prison: 'Moorland (HMP & YOI)',
            startTime: '23:15',
          }),
          reference: null,
        },
      )
    })
  })

  it('should display appointment confirmation', async () => {
    const { prisonerNumber } = PrisonerMockDataA

    req.flash = () => [formBody]

    const appointmentData = {
      heading: 'John Saunders’ appointments have been added',
      prisonerName: 'John Saunders',
      prisonerNumber,
      appointmentType: 'Activities',
      location: 'CES',
      date: formatDate(dateToIsoDate(formBody.date), 'long'),
      startTime: `${formBody.startTimeHours}:${formBody.startTimeMinutes}`,
      endTime: `${formBody.endTimeHours}:${formBody.endTimeMinutes}`,
      recurring: formBody.recurring,
      repeats: 'Daily',
      numberAdded: formBody.times,
      lastAppointmentDate: formatDate(addDays(new Date(), formBody.times - 1).toISOString(), 'long'),
      comment: formBody.comments,
    }

    await controller.displayAppointmentConfirmation()(req, res)

    expect(controller['appointmentService'].getAddAppointmentRefData).toHaveBeenCalledWith(
      req.middleware.clientToken,
      res.locals.user.activeCaseLoadId,
    )
    expect(res.render).toHaveBeenCalledWith('pages/appointments/appointmentConfirmation', {
      pageTitle: 'Appointment confirmation',
      ...appointmentData,
      addMoreUrl: `/prisoner/${prisonerNumber}/add-appointment`,
      profileUrl: `/prisoner/${prisonerNumber}`,
      movementSlipUrl: `/prisoner/${prisonerNumber}/movement-slips`,
    })
  })

  it('should display prepost appointment', async () => {
    const { prisonerNumber, bookingId, cellLocation } = PrisonerMockDataA
    const flash = {
      appointmentDefaults: {
        locationId: formBody.location,
        startTime: formatDateTimeISO(
          set(new Date(today), { hours: formBody.startTimeHours, minutes: formBody.startTimeMinutes }),
        ),
      },
      appointmentForm: formBody,
      formValues: {},
    }
    req.flash = (key: string) => {
      if (key === 'prePostAppointmentDetails') {
        return [flash]
      }
      return []
    }

    const appointmentData = {
      bookingId,
      miniBannerData: {
        prisonerName: 'Saunders, John',
        prisonerNumber,
        cellLocation: formatLocation(cellLocation),
      },
      location: locationsMock[0].userDescription,
      date: formBody.date,
      startTime: `${formBody.startTimeHours}:${formBody.startTimeMinutes}`,
      endTime: `${formBody.endTimeHours}:${formBody.endTimeMinutes}`,
      comments: formBody.comments,
      appointmentDate: formatDate(today, 'long'),
      formValues: {},
    }

    await controller.displayPrePostAppointments()(req, res)

    expect(controller['appointmentService'].getPrePostAppointmentRefData).toHaveBeenCalledWith(
      req.middleware.clientToken,
      res.locals.user.activeCaseLoadId,
    )
    expect(res.render).toHaveBeenCalledWith('pages/appointments/prePostAppointments', {
      pageTitle: 'Video link booking details',
      ...appointmentData,
      courts: [...courtLocationsSelectOptionsMock, { value: 'other', text: 'Other' }],
      locations: locationsSelectOptionsMock,
      refererUrl: `/prisoner/${prisonerNumber}`,
      errors: [],
    })
  })

  describe('POST Video Link Booking', () => {
    beforeEach(() => {
      req.body = {
        ...formBodyVLB,
        refererUrl: 'http://referer',
      }
    })
    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should create new video link booking appointment', async () => {
      const flash = {
        appointmentDefaults: {
          startTime: appointmentsToCreate.startTime,
          endTime: appointmentsToCreate.endTime,
          locationId: appointmentsToCreate.locationId,
          comment: appointmentsToCreate.comment,
        },
        appointmentForm: formBody,
      }
      req.flash = (key: string) => {
        if (key === 'postVLBDetails') {
          return [flash]
        }
        return []
      }

      await controller.postVideoLinkBooking()(req, res)

      expect(controller['appointmentService'].addVideoLinkBooking).toHaveBeenCalledWith(
        res.locals.user.token,
        videoLinkBookingForm,
      )

      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${PrisonerMockDataA.prisonerNumber}/prepost-appointment-confirmation`,
      )
    })

    it('should redirect back to form if errors', async () => {
      const errors: HmppsError[] = [
        {
          text: 'Error',
          href: '#error',
        },
      ]
      const flash = {
        appointmentDefaults: {
          startTime: appointmentsToCreate.startTime,
          endTime: appointmentsToCreate.endTime,
          locationId: appointmentsToCreate.locationId,
          comment: appointmentsToCreate.comment,
        },
        appointmentForm: formBody,
      }
      req.flash = (key: string) => {
        if (key === 'postVLBDetails') {
          return [flash]
        }
        return []
      }

      req.body.refererUrl = 'http://referer'
      req.errors = errors

      await controller.postVideoLinkBooking()(req, res)

      expect(controller['appointmentService'].addVideoLinkBooking).not.toHaveBeenCalled()

      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${PrisonerMockDataA.prisonerNumber}/prepost-appointments`)
    })
  })

  it('should display prepost appointment confirmation', async () => {
    const { prisonerNumber } = PrisonerMockDataA
    const flash = {
      appointmentDefaults: {
        startTime: appointmentsToCreate.startTime,
        endTime: appointmentsToCreate.endTime,
        locationId: appointmentsToCreate.locationId,
        comment: appointmentsToCreate.comment,
      },
      formValues: formBodyVLB,
    }
    req.flash = (key: string) => {
      if (key === 'prePostAppointmentDetails') {
        return [flash]
      }
      return []
    }

    const appointmentData = {
      prisonerName: 'John Saunders',
      prisonerNumber,
      prisonName: 'Moorland (HMP & YOI)',
      location: 'CES',
      date: formatDate(dateToIsoDate(formBody.date), 'long'),
      startTime: `${formBody.startTimeHours}:${formBody.startTimeMinutes}`,
      endTime: `${formBody.endTimeHours}:${formBody.endTimeMinutes}`,
      comments: formBody.comments,
      pre: `${locationsMock[0].userDescription} - 23:00 to 23:15`,
      post: `${locationsMock[1].userDescription} - 23:30 to 23:45`,
      court: courtLocationsSelectOptionsMock[0].text,
    }

    await controller.displayPrePostAppointmentConfirmation()(req, res)

    expect(controller['appointmentService'].getPrePostAppointmentRefData).toHaveBeenCalledWith(
      req.middleware.clientToken,
      res.locals.user.activeCaseLoadId,
    )
    expect(controller['appointmentService'].getAgencyDetails).toHaveBeenCalled()
    expect(controller['appointmentService'].getUserEmail).toHaveBeenCalled()
    expect(controller['notifyClient'].sendEmail).toHaveBeenCalled()
    expect(res.render).toHaveBeenCalledWith('pages/appointments/prePostAppointmentConfirmation', {
      pageTitle: 'Video link has been booked',
      ...appointmentData,
      profileUrl: `/prisoner/${prisonerNumber}`,
      movementSlipUrl: `/prisoner/${prisonerNumber}/movement-slips`,
    })
  })

  it('should display movement slips', async () => {
    req.session.movementSlipData = { movement: 'data' }

    await controller.displayPrisonerMovementSlips()(req, res)

    expect(req.session.movementSlipData).toBeUndefined()
    expect(res.render).toHaveBeenCalledWith('pages/appointments/movementSlips', {
      movement: 'data',
    })
  })

  it('should get offender events', async () => {
    req.query.date = '01/01/2023'
    req.query.prisonerNumber = PrisonerMockDataA.prisonerNumber

    await controller.getOffenderEvents()(req, res)

    expect(res.render).toHaveBeenCalledWith('components/scheduledEvents/scheduledEvents.njk', {
      events: offenderEventsMock,
      date: formatDate(dateToIsoDate(req.query.date), 'long'),
      prisonerName: formatName(PrisonerMockDataA.firstName, null, PrisonerMockDataA.lastName),
      type: 'offender',
    })
  })

  it('should get location events', async () => {
    req.query.date = '01/01/2023'
    req.query.locationId = locationsMock[0].locationId

    await controller.getLocationExistingEvents()(req, res)

    expect(res.render).toHaveBeenCalledWith('components/scheduledEvents/scheduledEvents.njk', {
      events: offenderEventsMock,
      date: formatDate(dateToIsoDate(req.query.date), 'long'),
      header: `Schedule for ${locationsMock[0].userDescription}`,
      type: 'location',
    })
  })

  it('should get recurring end date', async () => {
    req.query.date = '02/01/2023'
    req.query.repeats = 'DAILY'
    req.query.times = 5
    const endDate = formatDate(dateToIsoDate('06/01/2023'), 'full')

    await controller.getRecurringEndDate()(req, res)

    expect(res.send).toHaveBeenCalledWith(endDate)
  })
})
