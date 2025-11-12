import { addDays, addMinutes, set, subMinutes } from 'date-fns'
import { NextFunction, Request, Response } from 'express'
import { randomUUID } from 'crypto'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import AppointmentService, { AddAppointmentRefData, PrePostAppointmentRefData } from '../services/appointmentService'
import LocationDetailsService from '../services/locationDetailsService'
import AppointmentController from './appointmentController'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { repeatOptions } from '../data/interfaces/whereaboutsApi/Appointment'
import {
  dateToIsoDate,
  formatDate,
  formatDateISO,
  formatDateTimeISO,
  parseDate,
  timeFormat,
} from '../utils/dateHelpers'
import { vlbAppointmentMock, vlpmAppointmentMock } from '../data/localMockData/appointmentMock'
import { appointmentTypesMock, appointmentTypesSelectOptionsMock } from '../data/localMockData/appointmentTypesMock'
import { locationsApiMock, locationsApiSelectOptionsMock, locationsMock } from '../data/localMockData/locationsMock'

import HmppsError from '../interfaces/HmppsError'
import { formatLocation } from '../utils/utils'
import {
  courtLocationsMock,
  courtLocationsSelectOptionsMock,
  probationTeamsMock,
  probationTeamsSelectOptionsMock,
} from '../data/localMockData/courtLocationsMock'
import AgenciesMock from '../data/localMockData/agenciesDetails'
import { offenderEventsMock } from '../data/localMockData/offenderEventsMock'
import { auditServiceMock } from '../../tests/mocks/auditServiceMock'
import { HmppsUser } from '../interfaces/HmppsUser'
import {
  courtHearingTypes,
  courtHearingTypesSelectOptions,
  probationMeetingTypes,
  probationMeetingTypesSelectOptions,
} from '../data/localMockData/courtHearingsMock'
import LocationsApiLocation from '../data/interfaces/locationsInsidePrisonApi/LocationsApiLocation'
import { courtBookingMock, probationBookingMock } from '../data/localMockData/videoLinkBookingMock'
import { inmateDetailMock } from '../data/localMockData/inmateDetailMock'
import EphemeralDataService from '../services/ephemeralDataService'

jest.mock('../services/locationDetailsService.ts')

let req: Request
let res: Response
const next: NextFunction = jest.fn()
let controller: AppointmentController
const flash: jest.MockedFn<Request['flash'] | { (key?: string): object[] }> = jest.fn()

const cacheId = randomUUID()

const activeCaseLoadId = CaseLoadsDummyDataA[0].caseLoadId
const user: HmppsUser = {
  authSource: 'nomis',
  username: 'user487023',
  name: 'A Name',
  displayName: 'A Name',
  userRoles: [Role.PrisonUser],
  userId: '487023',
  staffId: 487023,
  caseLoads: CaseLoadsDummyDataA,
  token: 'USER_TOKEN',
  activeCaseLoadId,
}

const today = formatDateTimeISO(new Date(), { startOfDay: true })

const formBody = {
  appointmentType: appointmentTypesSelectOptionsMock[0].value,
  location: locationsApiSelectOptionsMock[0].value,
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
  prisonId: 'MDI',
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
  preAppointment: 'yes',
  preAppointmentLocation: locationsMock[0].locationId,
  postAppointment: 'yes',
  postAppointmentLocation: locationsMock[1].locationId,
  court: courtLocationsMock[0].code,
  hearingType: courtHearingTypes[0].code,
  cvpRequired: 'yes',
  videoLinkUrl: 'http://test.url',
}

jest.mock('../services/appointmentService.ts')
jest.mock('../services/locationDetailsService.ts')
jest.mock('../services/ephemeralDataService.ts')

describe('Appointment Controller', () => {
  const locationDetailsService: LocationDetailsService = new LocationDetailsService(
    null,
    null,
    null,
  ) as jest.Mocked<LocationDetailsService>

  const appointmentService: AppointmentService = new AppointmentService(
    null,
    null,
    null,
    null,
  ) as jest.Mocked<AppointmentService>

  const ephemeralDataService: EphemeralDataService = new EphemeralDataService(null) as jest.Mocked<EphemeralDataService>

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
        inmateDetail: inmateDetailMock,
      },
      flash,
    } as unknown as Request
    res = {
      locals: {
        user,
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        prisonerName: {
          firstLast: 'John Saunders',
          lastCommaFirst: 'Saunders, John',
          full: 'John Middle Names Saunders',
        },
      },
      render: jest.fn(),
      send: jest.fn(),
      redirect: jest.fn(),
    } as unknown as Response

    controller = new AppointmentController(
      appointmentService,
      locationDetailsService,
      ephemeralDataService,
      auditServiceMock(),
    )

    appointmentService.getAddAppointmentRefData = jest.fn(
      async (): Promise<AddAppointmentRefData> => ({
        appointmentTypes: appointmentTypesMock,
        locations: locationsApiMock,
        probationTeams: probationTeamsMock,
        meetingTypes: probationMeetingTypes,
      }),
    )

    appointmentService.getPrePostAppointmentRefData = jest.fn(async (): Promise<PrePostAppointmentRefData> => {
      return {
        courts: courtLocationsMock,
        hearingTypes: courtHearingTypes,
        locations: locationsApiMock,
      }
    })

    appointmentService.getAgencyDetails = jest.fn(async () => AgenciesMock)
    appointmentService.getExistingEventsForOffender = jest.fn(async () => offenderEventsMock)
    appointmentService.getExistingEventsForLocation = jest.fn(async () => offenderEventsMock)
    locationDetailsService.getLocationByNomisLocationId = jest.fn(
      async (_, locationId) =>
        ({
          [locationsMock[0].locationId]: locationsApiMock[0],
          [locationsMock[1].locationId]: locationsApiMock[1],
        })[locationId],
    )
    locationDetailsService.getLocationMappingUsingNomisLocationId = jest.fn(async () => ({
      dpsLocationId: 'abc-123',
      nomisLocationId: 1,
    }))
    locationDetailsService.getLocationByKey = jest.fn(
      async () =>
        ({
          id: 'abc-123',
          key: 'ABC',
        }) as LocationsApiLocation,
    )
    locationDetailsService.getLocationByNomisLocationId = jest.fn(
      async () =>
        ({
          id: 'abc-123',
          key: 'ABC',
        }) as LocationsApiLocation,
    )

    ephemeralDataService.cacheData = jest.fn(async () => cacheId)
  })

  it('should display add appointment', async () => {
    await controller.displayAddAppointment()(req, res, next)

    expect(controller.appointmentService.getAddAppointmentRefData).toHaveBeenCalledWith(
      req.middleware.clientToken,
      activeCaseLoadId,
    )

    expect(res.render).toHaveBeenCalledWith('pages/appointments/addAppointment', {
      pageTitle: 'Add an appointment',
      miniBannerData: {
        prisonerName: 'Saunders, John',
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        cellLocation: PrisonerMockDataA.cellLocation,
        prisonerThumbnailImageUrl: '/api/prisoner/G6123VU/image?imageId=1413311&fullSizeImage=false',
      },
      appointmentTypes: appointmentTypesSelectOptionsMock,
      probationTeams: probationTeamsSelectOptionsMock,
      locations: locationsApiSelectOptionsMock,
      meetingTypes: probationMeetingTypesSelectOptions,
      repeatOptions,
      today: formBody.date,
      formValues: {
        bookingId: 1102484,
        date: formBody.date,
        prisonId: 'MDI',
      },
      refererUrl: `/prisoner/${PrisonerMockDataA.prisonerNumber}`,
      errors: undefined,
    })
  })

  it('should display add appointment with data prepopulated when editing a VLB', async () => {
    req.params.appointmentId = '1' // editing appointment with ID 1
    appointmentService.getAppointment = jest.fn().mockResolvedValue(vlbAppointmentMock)
    appointmentService.getVideoLinkBooking = jest.fn().mockResolvedValue(courtBookingMock)

    await controller.displayAddAppointment()(req, res, next)

    expect(controller.appointmentService.getAddAppointmentRefData).toHaveBeenCalledWith(
      req.middleware.clientToken,
      activeCaseLoadId,
    )

    expect(res.render).toHaveBeenCalledWith('pages/appointments/addAppointment', {
      appointmentId: '1',
      pageTitle: 'Change appointment details',
      miniBannerData: {
        prisonerName: 'Saunders, John',
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        cellLocation: PrisonerMockDataA.cellLocation,
        prisonerThumbnailImageUrl: '/api/prisoner/G6123VU/image?imageId=1413311&fullSizeImage=false',
      },
      appointmentTypes: appointmentTypesSelectOptionsMock,
      probationTeams: probationTeamsSelectOptionsMock,
      locations: locationsApiSelectOptionsMock,
      meetingTypes: probationMeetingTypesSelectOptions,
      repeatOptions,
      today: formBody.date,
      formValues: {
        appointmentId: 1,
        prisonId: 'MDI',
        appointmentType: 'VLB',
        bookingId: 1102484,
        date: '01/01/2023',
        comments: 'Comment',
        endTimeHours: '13',
        endTimeMinutes: '34',
        location: 'abc-123',
        recurring: 'no',
        startTimeHours: '12',
        startTimeMinutes: '34',
      },
      refererUrl: `/prisoner/${PrisonerMockDataA.prisonerNumber}`,
      errors: undefined,
    })
  })

  it('should display add appointment with data prepopulated when editing a VLPM', async () => {
    req.params.appointmentId = '1' // editing appointment with ID 1
    appointmentService.getAppointment = jest.fn().mockResolvedValue(vlpmAppointmentMock)
    appointmentService.getVideoLinkBooking = jest.fn().mockResolvedValue(probationBookingMock)

    await controller.displayAddAppointment()(req, res, next)

    expect(controller.appointmentService.getAddAppointmentRefData).toHaveBeenCalledWith(
      req.middleware.clientToken,
      activeCaseLoadId,
    )

    expect(res.render).toHaveBeenCalledWith('pages/appointments/addAppointment', {
      appointmentId: '1',
      pageTitle: 'Change appointment details',
      miniBannerData: {
        prisonerName: 'Saunders, John',
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        cellLocation: PrisonerMockDataA.cellLocation,
        prisonerThumbnailImageUrl: '/api/prisoner/G6123VU/image?imageId=1413311&fullSizeImage=false',
      },
      appointmentTypes: appointmentTypesSelectOptionsMock,
      probationTeams: probationTeamsSelectOptionsMock,
      locations: locationsApiSelectOptionsMock,
      meetingTypes: probationMeetingTypesSelectOptions,
      repeatOptions,
      today: formBody.date,
      formValues: {
        appointmentId: 1,
        bookingId: 1102484,
        prisonId: 'MDI',
        appointmentType: 'VLPM',
        probationTeam: 'BLACKPP',
        officerEmail: 'Test email',
        officerFullName: 'Test name',
        officerTelephone: 'Test number',
        meetingType: 'PSR',
        date: '01/01/2023',
        comments: 'Comment',
        endTimeHours: '13',
        endTimeMinutes: '34',
        location: 'abc-123',
        recurring: 'no',
        startTimeHours: '12',
        startTimeMinutes: '34',
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

    it('should create new appointment', async () => {
      locationDetailsService.getLocationMappingUsingDpsLocationId = jest.fn(async () => ({
        nomisLocationId: 1234,
        dpsLocationId: 'location-1',
        key: 'ABC',
      }))

      await controller.post()(req, res, next)

      expect(controller.appointmentService.createAppointments).toHaveBeenCalledWith(req.middleware.clientToken, {
        ...appointmentsToCreate,
        locationId: 1234,
      })

      expect(flash).toHaveBeenCalledWith('appointmentForm', formBody)

      expect(locationDetailsService.getLocationMappingUsingDpsLocationId).toHaveBeenCalledWith(
        req.middleware.clientToken,
        formBody.location,
      )

      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${PrisonerMockDataA.prisonerNumber}/appointment-confirmation`,
      )
    })

    it('should create new probation video link booking for VLPM appointment', async () => {
      req.body = {
        ...formBody,
        appointmentType: 'VLPM',
        probationTeam: 'BLACKPP',
        officerDetailsNotKnown: 'true',
        meetingType: 'PSR',
        notesForPrisoners: 'prisoner notes',
        notesForStaff: 'staff notes',
      }

      locationDetailsService.getLocationMappingUsingDpsLocationId = jest.fn(async () => ({
        nomisLocationId: 1234,
        dpsLocationId: 'location-1',
        key: 'ABC',
      }))

      locationDetailsService.getLocation = jest.fn(async () => ({
        id: 'location-1',
        key: 'ABC',
        localName: 'Local name one',
      }))

      await controller.post()(req, res, next)

      expect(controller.appointmentService.addVideoLinkBooking).toHaveBeenCalledWith(req.middleware.clientToken, {
        bookingType: 'PROBATION',
        prisoners: [
          {
            prisonerNumber: PrisonerMockDataA.prisonerNumber,
            prisonCode: formBody.prisonId,
            appointments: [
              {
                type: 'VLB_PROBATION',
                locationKey: locationsApiMock[0].key,
                date: formatDateISO(new Date(appointmentsToCreate.startTime)),
                startTime: timeFormat(formatDateTimeISO(new Date(appointmentsToCreate.startTime))),
                endTime: timeFormat(appointmentsToCreate.endTime),
              },
            ],
          },
        ],
        probationTeamCode: 'BLACKPP',
        probationMeetingType: 'PSR',
        notesForPrisoners: 'prisoner notes',
        notesForStaff: 'staff notes',
      })

      expect(flash).toHaveBeenCalledWith('appointmentForm', req.body)

      expect(locationDetailsService.getLocationMappingUsingDpsLocationId).toHaveBeenCalledWith(
        req.middleware.clientToken,
        formBody.location,
      )

      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${PrisonerMockDataA.prisonerNumber}/appointment-confirmation`,
      )
    })

    it('should amend the existing probation video link booking for VLPM appointment', async () => {
      req.body = {
        ...formBody,
        appointmentId: 1,
        appointmentType: 'VLPM',
        probationTeam: 'BLACKPP',
        officerDetailsNotKnown: 'true',
        meetingType: 'PSR',
        notesForPrisoners: 'amended prisoner notes',
        notesForStaff: 'amended staff notes',
      }

      appointmentService.getAppointment = jest.fn().mockResolvedValue(vlpmAppointmentMock)
      appointmentService.getVideoLinkBooking = jest.fn().mockResolvedValue(probationBookingMock)

      locationDetailsService.getLocationMappingUsingDpsLocationId = jest.fn(async () => ({
        nomisLocationId: 1234,
        dpsLocationId: 'location-1',
        key: 'ABC',
      }))

      locationDetailsService.getLocation = jest.fn(async () => ({
        id: 'location-1',
        key: 'ABC',
        localName: 'Local name one',
      }))

      await controller.post()(req, res, next)

      expect(controller.appointmentService.amendVideoLinkBooking).toHaveBeenCalledWith(req.middleware.clientToken, 1, {
        bookingType: 'PROBATION',
        prisoners: [
          {
            prisonerNumber: PrisonerMockDataA.prisonerNumber,
            prisonCode: formBody.prisonId,
            appointments: [
              {
                type: 'VLB_PROBATION',
                locationKey: locationsApiMock[0].key,
                date: formatDateISO(new Date(appointmentsToCreate.startTime)),
                startTime: timeFormat(formatDateTimeISO(new Date(appointmentsToCreate.startTime))),
                endTime: timeFormat(appointmentsToCreate.endTime),
              },
            ],
          },
        ],
        probationTeamCode: 'BLACKPP',
        probationMeetingType: 'PSR',
        notesForPrisoners: 'amended prisoner notes',
        notesForStaff: 'amended staff notes',
      })

      expect(flash).toHaveBeenCalledWith('appointmentForm', req.body)

      expect(locationDetailsService.getLocationMappingUsingDpsLocationId).toHaveBeenCalledWith(
        req.middleware.clientToken,
        formBody.location,
      )

      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${PrisonerMockDataA.prisonerNumber}/appointment-confirmation`,
      )
    })

    it('should redirect to VLB page with cacheId', async () => {
      req.body = {
        ...formBody,
        appointmentType: 'VLB',
        refererUrl: 'http://referer',
      }

      locationDetailsService.getLocationMappingUsingDpsLocationId = jest.fn(async () => ({
        nomisLocationId: 1234,
        dpsLocationId: 'location-1',
        key: 'ABC',
      }))

      await controller.post()(req, res, next)

      expect(controller.appointmentService.createAppointments).not.toHaveBeenCalled()

      expect(ephemeralDataService.cacheData).toHaveBeenCalledWith({
        appointmentDefaults: { ...appointmentsToCreate, locationId: 1234, appointmentType: 'VLB' },
        appointmentForm: { ...formBody, appointmentType: 'VLB' },
      })
      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${PrisonerMockDataA.prisonerNumber}/prepost-appointments?appointmentData=${cacheId}`,
      )
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

      await controller.post()(req, res, next)

      expect(controller.appointmentService.createAppointments).not.toHaveBeenCalled()

      expect(flash).toHaveBeenCalledWith('errors', errors)
      expect(flash).toHaveBeenCalledWith('refererUrl', 'http://referer')
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${PrisonerMockDataA.prisonerNumber}/add-appointment`)
    })
  })

  it('should display appointment confirmation', async () => {
    const { prisonerNumber } = PrisonerMockDataA

    flash.mockImplementation(() => [formBody])

    const appointmentData = {
      heading: 'John Saunders’ appointments have been added',
      prisonerName: 'John Saunders',
      prisonerNumber,
      appointmentType: 'Activities',
      appointmentTypeCode: 'ACTI',
      location: 'Local name one',
      date: formatDate(dateToIsoDate(formBody.date), 'long'),
      startTime: `${formBody.startTimeHours}:${formBody.startTimeMinutes}`,
      endTime: `${formBody.endTimeHours}:${formBody.endTimeMinutes}`,
      recurring: formBody.recurring,
      repeats: 'Daily',
      numberAdded: formBody.times,
      lastAppointmentDate: formatDate(addDays(new Date(), formBody.times - 1).toISOString(), 'long'),
      comment: formBody.comments,
    }

    await controller.displayAppointmentConfirmation()(req, res, next)

    expect(controller.appointmentService.getAddAppointmentRefData).toHaveBeenCalledWith(
      req.middleware.clientToken,
      activeCaseLoadId,
    )
    expect(res.render).toHaveBeenCalledWith('pages/appointments/appointmentConfirmation', {
      pageTitle: 'Appointment confirmation',
      ...appointmentData,
      addMoreUrl: `/prisoner/${prisonerNumber}/add-appointment`,
      profileUrl: `/prisoner/${prisonerNumber}`,
      movementSlipUrl: `/prisoner/${prisonerNumber}/movement-slips`,
    })
  })

  it('should display appointment amendment confirmation', async () => {
    const { prisonerNumber } = PrisonerMockDataA

    // For amendments an appointmentId will also be present
    flash.mockImplementation(() => [{ ...formBody, appointmentId: 1 }])

    const appointmentData = {
      heading: 'John Saunders’ appointments have been updated',
      prisonerName: 'John Saunders',
      prisonerNumber,
      appointmentType: 'Activities',
      appointmentTypeCode: 'ACTI',
      location: 'Local name one',
      date: formatDate(dateToIsoDate(formBody.date), 'long'),
      startTime: `${formBody.startTimeHours}:${formBody.startTimeMinutes}`,
      endTime: `${formBody.endTimeHours}:${formBody.endTimeMinutes}`,
      recurring: formBody.recurring,
      repeats: 'Daily',
      numberAdded: formBody.times,
      lastAppointmentDate: formatDate(addDays(new Date(), formBody.times - 1).toISOString(), 'long'),
      comment: formBody.comments,
    }

    await controller.displayAppointmentConfirmation()(req, res, next)

    expect(controller.appointmentService.getAddAppointmentRefData).toHaveBeenCalledWith(
      req.middleware.clientToken,
      activeCaseLoadId,
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
    const { prisonerNumber, cellLocation } = PrisonerMockDataA
    formBody.location = locationsMock[0].locationId

    req.query.appointmentData = cacheId

    flash.mockImplementation(() => [])
    ephemeralDataService.getData = jest.fn().mockResolvedValue({
      key: cacheId,
      value: {
        appointmentDefaults: {
          locationId: formBody.location,
          startTime: formatDateTimeISO(
            set(new Date(today), { hours: formBody.startTimeHours, minutes: formBody.startTimeMinutes }),
          ),
        },
        appointmentForm: formBody,
        formValues: {},
      },
    })

    const appointmentData = {
      miniBannerData: {
        prisonerName: 'Saunders, John',
        prisonerNumber,
        cellLocation: formatLocation(cellLocation),
        prisonerThumbnailImageUrl: '/api/prisoner/G6123VU/image?imageId=1413311&fullSizeImage=false',
      },
      location: locationsApiMock[0].localName,
      date: formBody.date,
      startTime: `${formBody.startTimeHours}:${formBody.startTimeMinutes}`,
      endTime: `${formBody.endTimeHours}:${formBody.endTimeMinutes}`,
      comments: formBody.comments,
      appointmentDate: formatDate(today, 'long'),
      formValues: {},
    }

    locationDetailsService.getLocationMappingUsingNomisLocationId = jest.fn(async () => ({
      nomisLocationId: 1234,
      dpsLocationId: 'location-1',
      key: 'ABC',
    }))

    await controller.displayPrePostAppointments()(req, res, next)

    expect(controller.appointmentService.getPrePostAppointmentRefData).toHaveBeenCalledWith(
      req.middleware.clientToken,
      activeCaseLoadId,
    )
    expect(res.render).toHaveBeenCalledWith('pages/appointments/prePostAppointments', {
      pageTitle: 'Video link booking details',
      ...appointmentData,
      courts: courtLocationsSelectOptionsMock,
      locations: locationsApiSelectOptionsMock,
      refererUrl: `/prisoner/${prisonerNumber}`,
      errors: [],
      hearingTypes: courtHearingTypesSelectOptions,
      cacheId,
    })
  })

  it('should display prepost appointment with data prepopulated when editing', async () => {
    req.params.appointmentId = '1'
    req.query.appointmentData = cacheId

    appointmentService.getAppointment = jest.fn().mockResolvedValue(vlbAppointmentMock)
    appointmentService.getVideoLinkBooking = jest.fn().mockResolvedValue(courtBookingMock)

    const { prisonerNumber, cellLocation } = PrisonerMockDataA
    formBody.location = locationsMock[0].locationId

    flash.mockImplementation(() => [])
    ephemeralDataService.getData = jest.fn().mockResolvedValue({
      key: cacheId,
      value: {
        appointmentDefaults: {
          locationId: formBody.location,
          startTime: formatDateTimeISO(
            set(new Date(today), { hours: formBody.startTimeHours, minutes: formBody.startTimeMinutes }),
          ),
        },
        appointmentForm: formBody,
      },
    })

    const appointmentData = {
      appointmentId: '1',
      miniBannerData: {
        prisonerName: 'Saunders, John',
        prisonerNumber,
        cellLocation: formatLocation(cellLocation),
        prisonerThumbnailImageUrl: '/api/prisoner/G6123VU/image?imageId=1413311&fullSizeImage=false',
      },
      location: locationsApiMock[0].localName,
      date: formBody.date,
      startTime: `${formBody.startTimeHours}:${formBody.startTimeMinutes}`,
      endTime: `${formBody.endTimeHours}:${formBody.endTimeMinutes}`,
      comments: formBody.comments,
      appointmentDate: formatDate(today, 'long'),
      formValues: {
        bookingType: undefined as string,
        court: 'ABERCV',
        cvpRequired: 'yes',
        hearingType: 'APPEAL',
        postAppointment: 'yes',
        postAppointmentLocation: 'abc-123',
        preAppointment: 'yes',
        preAppointmentLocation: 'abc-123',
        videoLinkUrl: 'http://bvls.test.url',
        guestPinRequired: 'no',
      },
    }

    locationDetailsService.getLocationMappingUsingNomisLocationId = jest.fn(async () => ({
      nomisLocationId: 1234,
      dpsLocationId: 'location-1',
      key: 'ABC',
    }))

    await controller.displayPrePostAppointments()(req, res, next)

    expect(controller.appointmentService.getPrePostAppointmentRefData).toHaveBeenCalledWith(
      req.middleware.clientToken,
      activeCaseLoadId,
    )
    expect(res.render).toHaveBeenCalledWith('pages/appointments/prePostAppointments', {
      pageTitle: 'Change appointment details',
      ...appointmentData,
      courts: courtLocationsSelectOptionsMock,
      locations: locationsApiSelectOptionsMock,
      refererUrl: `/prisoner/${prisonerNumber}`,
      errors: [],
      hearingTypes: courtHearingTypesSelectOptions,
      cacheId,
    })
  })

  it('should redirect if no cached prepost appointment data is found', async () => {
    ephemeralDataService.getData = jest.fn().mockImplementation(() => undefined)

    await controller.displayPrePostAppointments()(req, res, next)

    expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${PrisonerMockDataA.prisonerNumber}/add-appointment`)
  })

  describe('POST Video Link Booking', () => {
    beforeEach(() => {
      req.body = {
        ...formBodyVLB,
        cacheId,
        refererUrl: 'http://referer',
      }
      flash.mockImplementation(() => [])
    })

    it('should create new video link booking appointment', async () => {
      ephemeralDataService.getData = jest.fn().mockResolvedValue({
        key: cacheId,
        value: {
          appointmentDefaults: {
            startTime: appointmentsToCreate.startTime,
            endTime: appointmentsToCreate.endTime,
            locationId: appointmentsToCreate.locationId,
          },
          appointmentForm: {
            ...formBody,
            appointmentType: 'VLB',
            notesForPrisoners: 'prisoner notes',
            notesForStaff: 'staff notes',
          },
        },
      })

      locationDetailsService.getLocation = jest.fn(async () => ({
        id: 'location-1',
        key: 'ABC',
        localName: 'Local name one',
      }))

      await controller.postVideoLinkBooking()(req, res, next)

      expect(controller.appointmentService.addVideoLinkBooking).toHaveBeenCalledWith(req.middleware.clientToken, {
        bookingType: 'COURT',
        prisoners: [
          {
            prisonerNumber: PrisonerMockDataA.prisonerNumber,
            prisonCode: formBody.prisonId,
            appointments: [
              {
                type: 'VLB_COURT_PRE',
                locationKey: locationsApiMock[0].key,
                date: formatDateISO(new Date(appointmentsToCreate.startTime)),
                startTime: timeFormat(formatDateTimeISO(subMinutes(new Date(appointmentsToCreate.startTime), 15))),
                endTime: timeFormat(appointmentsToCreate.startTime),
              },
              {
                type: 'VLB_COURT_MAIN',
                locationKey: locationsApiMock[0].key,
                date: formatDateISO(new Date(appointmentsToCreate.startTime)),
                startTime: timeFormat(formatDateTimeISO(new Date(appointmentsToCreate.startTime))),
                endTime: timeFormat(appointmentsToCreate.endTime),
              },
              {
                type: 'VLB_COURT_POST',
                locationKey: locationsApiMock[1].key,
                date: formatDateISO(new Date(appointmentsToCreate.startTime)),
                startTime: timeFormat(appointmentsToCreate.endTime),
                endTime: timeFormat(formatDateTimeISO(addMinutes(new Date(appointmentsToCreate.endTime), 15))),
              },
            ],
          },
        ],
        courtCode: 'ABC',
        courtHearingType: 'APPEAL',
        videoLinkUrl: 'http://test.url',
        notesForPrisoners: 'prisoner notes',
        notesForStaff: 'staff notes',
      })

      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${PrisonerMockDataA.prisonerNumber}/prepost-appointment-confirmation?appointmentData=${cacheId}`,
      )
    })

    it('should amend the existing video link booking appointment', async () => {
      ephemeralDataService.getData = jest.fn().mockResolvedValue({
        key: cacheId,
        value: {
          appointmentDefaults: {
            startTime: appointmentsToCreate.startTime,
            endTime: appointmentsToCreate.endTime,
            locationId: appointmentsToCreate.locationId,
          },
          appointmentForm: {
            ...formBody,
            appointmentId: 1,
            appointmentType: 'VLB',
            notesForPrisoners: 'amended prisoner notes',
            notesForStaff: 'ameneded staff notes',
          },
        },
      })

      appointmentService.getAppointment = jest.fn().mockResolvedValue(vlbAppointmentMock)
      appointmentService.getVideoLinkBooking = jest.fn().mockResolvedValue(courtBookingMock)

      locationDetailsService.getLocation = jest.fn(async () => ({
        id: 'location-1',
        key: 'ABC',
        localName: 'Local name one',
      }))

      await controller.postVideoLinkBooking()(req, res, next)

      expect(controller.appointmentService.amendVideoLinkBooking).toHaveBeenCalledWith(req.middleware.clientToken, 1, {
        bookingType: 'COURT',
        prisoners: [
          {
            prisonerNumber: PrisonerMockDataA.prisonerNumber,
            prisonCode: formBody.prisonId,
            appointments: [
              {
                type: 'VLB_COURT_PRE',
                locationKey: locationsApiMock[0].key,
                date: formatDateISO(new Date(appointmentsToCreate.startTime)),
                startTime: timeFormat(formatDateTimeISO(subMinutes(new Date(appointmentsToCreate.startTime), 15))),
                endTime: timeFormat(appointmentsToCreate.startTime),
              },
              {
                type: 'VLB_COURT_MAIN',
                locationKey: locationsApiMock[0].key,
                date: formatDateISO(new Date(appointmentsToCreate.startTime)),
                startTime: timeFormat(formatDateTimeISO(new Date(appointmentsToCreate.startTime))),
                endTime: timeFormat(appointmentsToCreate.endTime),
              },
              {
                type: 'VLB_COURT_POST',
                locationKey: locationsApiMock[1].key,
                date: formatDateISO(new Date(appointmentsToCreate.startTime)),
                startTime: timeFormat(appointmentsToCreate.endTime),
                endTime: timeFormat(formatDateTimeISO(addMinutes(new Date(appointmentsToCreate.endTime), 15))),
              },
            ],
          },
        ],
        courtCode: 'ABC',
        courtHearingType: 'APPEAL',
        videoLinkUrl: 'http://test.url',
        notesForPrisoners: 'amended prisoner notes',
        notesForStaff: 'ameneded staff notes',
      })

      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${PrisonerMockDataA.prisonerNumber}/prepost-appointment-confirmation?appointmentData=${cacheId}`,
      )
    })

    it('should redirect back to form if errors', async () => {
      const errors: HmppsError[] = [
        {
          text: 'Error',
          href: '#error',
        },
      ]

      ephemeralDataService.getData = jest.fn().mockResolvedValue({
        key: cacheId,
        value: {
          appointmentDefaults: {
            startTime: appointmentsToCreate.startTime,
            endTime: appointmentsToCreate.endTime,
            locationId: appointmentsToCreate.locationId,
            comment: appointmentsToCreate.comment,
          },
          appointmentForm: formBody,
        },
      })

      req.body.refererUrl = 'http://referer'
      req.errors = errors

      await controller.postVideoLinkBooking()(req, res, next)

      expect(controller.appointmentService.addVideoLinkBooking).not.toHaveBeenCalled()

      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${PrisonerMockDataA.prisonerNumber}/prepost-appointments?appointmentData=${cacheId}`,
      )
    })

    it('should redirect back to add appointments page if no cached appointment data exists', async () => {
      ephemeralDataService.getData = jest.fn().mockImplementation(() => undefined)

      await controller.postVideoLinkBooking()(req, res, next)

      expect(controller.appointmentService.addVideoLinkBooking).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${PrisonerMockDataA.prisonerNumber}/add-appointment`)
    })
  })

  describe('Display prepost appointment confirmation', () => {
    beforeEach(() => {
      flash.mockImplementation(() => [])
    })

    it('should display confirmation', async () => {
      const { prisonerNumber } = PrisonerMockDataA

      ephemeralDataService.getData = jest.fn().mockResolvedValue({
        key: cacheId,
        value: {
          appointmentDefaults: {
            startTime: appointmentsToCreate.startTime,
            endTime: appointmentsToCreate.endTime,
            locationId: appointmentsToCreate.locationId,
            comment: appointmentsToCreate.comment,
          },
          appointmentForm: {
            location: locationsMock[0].locationId,
          },
          formValues: {
            hearingType: courtHearingTypes[0].code,
            court: courtLocationsMock[2].code,
            cvpRequired: 'yes',
            videoLinkUrl: 'http://bvls.test.url',
            guestPinRequired: 'no',
            preAppointment: 'no',
            postAppointment: 'no',
          },
        },
      })

      const appointmentData = {
        prisonName: 'Moorland (HMP & YOI)',
        appointmentType: 'Video Link - Court Hearing',
        appointmentTypeCode: 'VLB',
        location: locationsApiMock[0].localName,
        date: formatDate(dateToIsoDate(formBody.date), 'long'),
        startTime: `${formBody.startTimeHours}:${formBody.startTimeMinutes}`,
        endTime: `${formBody.endTimeHours}:${formBody.endTimeMinutes}`,
        comments: formBody.comments,
        pre: undefined as string,
        post: undefined as string,
        court: courtLocationsMock[2].description,
        hearingType: courtHearingTypes[0].description,
      }

      locationDetailsService.getLocationMappingUsingNomisLocationId = jest.fn(async () => ({
        nomisLocationId: 1234,
        dpsLocationId: 'location-1',
        key: 'ABC',
      }))

      await controller.displayPrePostAppointmentConfirmation()(req, res, next)

      expect(controller.appointmentService.getPrePostAppointmentRefData).toHaveBeenCalledWith(
        req.middleware.clientToken,
        activeCaseLoadId,
      )
      expect(controller.appointmentService.getAgencyDetails).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/appointments/prePostAppointmentConfirmation', {
        pageTitle: 'The video link has been booked',
        ...appointmentData,
        profileUrl: `/prisoner/${prisonerNumber}`,
        movementSlipUrl: `/prisoner/${prisonerNumber}/movement-slips`,
        videoLinkUrl: 'http://bvls.test.url',
        mustContactTheCourt: true,
      })
    })

    it('should display confirmation when amending', async () => {
      const { prisonerNumber } = PrisonerMockDataA

      ephemeralDataService.getData = jest.fn().mockResolvedValue({
        key: cacheId,
        value: {
          appointmentId: 1,
          appointmentDefaults: {
            startTime: appointmentsToCreate.startTime,
            endTime: appointmentsToCreate.endTime,
            locationId: appointmentsToCreate.locationId,
            comment: appointmentsToCreate.comment,
          },
          appointmentForm: {
            location: locationsMock[0].locationId,
          },
          formValues: {
            hearingType: courtHearingTypes[0].code,
            court: courtLocationsMock[2].code,
            cvpRequired: 'yes',
            videoLinkUrl: 'http://bvls.test.url',
            guestPinRequired: 'no',
            preAppointment: 'no',
            postAppointment: 'no',
          },
        },
      })

      const appointmentData = {
        appointmentType: 'Video Link - Court Hearing',
        appointmentTypeCode: 'VLB',
        prisonName: 'Moorland (HMP & YOI)',
        location: locationsApiMock[0].localName,
        date: formatDate(dateToIsoDate(formBody.date), 'long'),
        startTime: `${formBody.startTimeHours}:${formBody.startTimeMinutes}`,
        endTime: `${formBody.endTimeHours}:${formBody.endTimeMinutes}`,
        comments: formBody.comments,
        pre: undefined as string,
        post: undefined as string,
        court: courtLocationsMock[2].description,
        hearingType: courtHearingTypes[0].description,
      }

      locationDetailsService.getLocationMappingUsingNomisLocationId = jest.fn(async () => ({
        nomisLocationId: 1234,
        dpsLocationId: 'location-1',
        key: 'ABC',
      }))

      await controller.displayPrePostAppointmentConfirmation()(req, res, next)

      expect(controller.appointmentService.getPrePostAppointmentRefData).toHaveBeenCalledWith(
        req.middleware.clientToken,
        activeCaseLoadId,
      )
      expect(controller.appointmentService.getAgencyDetails).toHaveBeenCalled()
      expect(res.render).toHaveBeenCalledWith('pages/appointments/prePostAppointmentConfirmation', {
        pageTitle: 'The video link has been updated',
        ...appointmentData,
        profileUrl: `/prisoner/${prisonerNumber}`,
        movementSlipUrl: `/prisoner/${prisonerNumber}/movement-slips`,
        videoLinkUrl: 'http://bvls.test.url',
        mustContactTheCourt: true,
      })
    })

    it('should redirect to add appointment page if no cached appointment data exists', async () => {
      ephemeralDataService.getData = jest.fn().mockImplementation(() => undefined)

      await controller.displayPrePostAppointmentConfirmation()(req, res, next)

      expect(res.redirect).toHaveBeenCalledWith(`/prisoner/${PrisonerMockDataA.prisonerNumber}/add-appointment`)
    })
  })

  it('should display movement slips', async () => {
    req.session.movementSlipData = { movement: 'data' }

    await controller.displayPrisonerMovementSlips()(req, res, next)

    expect(req.session.movementSlipData).toBeUndefined()
    expect(res.render).toHaveBeenCalledWith('pages/appointments/movementSlips', {
      movement: 'data',
    })
  })

  it('should get offender events', async () => {
    req.query.date = '01/01/2023'
    req.query.prisonerNumber = PrisonerMockDataA.prisonerNumber

    await controller.getOffenderEvents()(req, res, next)

    expect(res.render).toHaveBeenCalledWith('components/scheduledEvents/scheduledEvents.njk', {
      events: offenderEventsMock,
      date: formatDate(dateToIsoDate(req.query.date), 'long'),
      type: 'offender',
    })
  })

  it('should get location by id', async () => {
    req.query.date = '01/01/2023'
    req.query.locationId = locationsApiMock[0].id

    locationDetailsService.getLocation = jest.fn().mockResolvedValue({ id: 'location-1' })

    locationDetailsService.getLocationMappingUsingDpsLocationId = jest.fn().mockResolvedValue({
      nomisLocationId: 1234,
      dpsLocationId: 'location-1',
    })

    await controller.getLocationExistingEvents()(req, res, next)
    expect(locationDetailsService.getLocation).toHaveBeenCalledWith(req.middleware.clientToken, req.query.locationId)
  })

  it('should get location events', async () => {
    req.query.date = '01/01/2023'
    req.query.locationId = locationsApiMock[0].id

    locationDetailsService.getLocation = jest.fn(async () => locationsApiMock[0])

    locationDetailsService.getLocationMappingUsingDpsLocationId = jest.fn().mockResolvedValue({
      nomisLocationId: 1234,
      dpsLocationId: 'location-1',
    })

    await controller.getLocationExistingEvents()(req, res, next)

    expect(locationDetailsService.getLocationMappingUsingDpsLocationId).toHaveBeenCalledWith(
      req.middleware.clientToken,
      req.query.locationId,
    )

    expect(res.render).toHaveBeenCalledWith('components/scheduledEvents/scheduledEvents.njk', {
      events: offenderEventsMock,
      date: formatDate(dateToIsoDate(req.query.date), 'long'),
      header: 'Schedule for Local name one',
      type: 'location',
    })
  })

  it('should get recurring end date', async () => {
    req.query.date = '02/01/2023'
    req.query.repeats = 'DAILY'
    req.query.times = '5'
    const endDate = formatDate(dateToIsoDate('06/01/2023'), 'full')

    await controller.getRecurringEndDate()(req, res, next)

    expect(res.send).toHaveBeenCalledWith(endDate)
  })
})
