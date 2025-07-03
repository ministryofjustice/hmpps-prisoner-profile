import { addDays, addMinutes, set, subMinutes } from 'date-fns'
import { Role } from '../data/enums/role'
import { CaseLoadsDummyDataA } from '../data/localMockData/caseLoad'
import PrisonerSearchService from '../services/prisonerSearch'
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
import { formatLocation, formatName } from '../utils/utils'
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

jest.mock('../services/locationDetailsService.ts')

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

jest.mock('../services/prisonerSearch.ts')
jest.mock('../services/appointmentService.ts')
jest.mock('../services/locationDetailsService.ts')

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

    controller = new AppointmentController(
      appointmentService,
      prisonerSearchService,
      auditServiceMock(),
      locationDetailsService,
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
    prisonerSearchService.getPrisonerDetails = jest.fn(async () => PrisonerMockDataA)
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

  // Check when BVLS feature toggles are removed - blvsMasterPublicPrivateNotesEnabled and blvsHmctsLinkGuestPinEnabled

  it('should display add appointment with data prepopulated when editing a VLB', async () => {
    req.params.appointmentId = 1 // editing appointment with ID 1
    appointmentService.getAppointment = jest.fn().mockResolvedValue(vlbAppointmentMock)
    appointmentService.getVideoLinkBooking = jest.fn().mockResolvedValue(courtBookingMock)

    await controller.displayAddAppointment()(req, res)

    expect(controller['appointmentService'].getAddAppointmentRefData).toHaveBeenCalledWith(
      req.middleware.clientToken,
      res.locals.user.activeCaseLoadId,
    )

    expect(res.render).toHaveBeenCalledWith('pages/appointments/addAppointment', {
      appointmentId: 1,
      pageTitle: 'Change appointment details',
      miniBannerData: {
        prisonerName: 'Saunders, John',
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        cellLocation: PrisonerMockDataA.cellLocation,
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

  // Check when BVLS feature toggles are removed - blvsMasterPublicPrivateNotesEnabled and blvsHmctsLinkGuestPinEnabled

  it('should display add appointment with data prepopulated when editing a VLPM', async () => {
    req.params.appointmentId = 1 // editing appointment with ID 1
    appointmentService.getAppointment = jest.fn().mockResolvedValue(vlpmAppointmentMock)
    appointmentService.getVideoLinkBooking = jest.fn().mockResolvedValue(probationBookingMock)

    await controller.displayAddAppointment()(req, res)

    expect(controller['appointmentService'].getAddAppointmentRefData).toHaveBeenCalledWith(
      req.middleware.clientToken,
      res.locals.user.activeCaseLoadId,
    )

    expect(res.render).toHaveBeenCalledWith('pages/appointments/addAppointment', {
      appointmentId: 1,
      pageTitle: 'Change appointment details',
      miniBannerData: {
        prisonerName: 'Saunders, John',
        prisonerNumber: PrisonerMockDataA.prisonerNumber,
        cellLocation: PrisonerMockDataA.cellLocation,
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
    afterEach(() => {
      jest.resetAllMocks()
    })

    it('should create new appointment', async () => {
      locationDetailsService.getLocationMappingUsingDpsLocationId = jest.fn(async () => ({
        nomisLocationId: 1234,
        dpsLocationId: 'location-1',
        key: 'ABC',
      }))

      await controller.post()(req, res)

      expect(controller['appointmentService'].createAppointments).toHaveBeenCalledWith(req.middleware.clientToken, {
        ...appointmentsToCreate,
        locationId: 1234,
      })

      expect(req.flash).toHaveBeenCalledWith('appointmentForm', formBody)

      expect(locationDetailsService.getLocationMappingUsingDpsLocationId).toHaveBeenCalledWith(
        req.middleware.clientToken,
        formBody.location,
      )

      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${PrisonerMockDataA.prisonerNumber}/appointment-confirmation`,
      )
    })

    // Check when BVLS feature toggles are removed - blvsMasterPublicPrivateNotesEnabled and blvsHmctsLinkGuestPinEnabled

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

      await controller.post()(req, res)

      expect(controller['appointmentService'].addVideoLinkBooking).toHaveBeenCalledWith(req.middleware.clientToken, {
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

      expect(req.flash).toHaveBeenCalledWith('appointmentForm', req.body)

      expect(locationDetailsService.getLocationMappingUsingDpsLocationId).toHaveBeenCalledWith(
        req.middleware.clientToken,
        formBody.location,
      )

      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${PrisonerMockDataA.prisonerNumber}/appointment-confirmation`,
      )
    })

    // Check when BVLS feature toggles are removed - blvsMasterPublicPrivateNotesEnabled and blvsHmctsLinkGuestPinEnabled

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

      await controller.post()(req, res)

      expect(controller['appointmentService'].amendVideoLinkBooking).toHaveBeenCalledWith(
        req.middleware.clientToken,
        1,
        {
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
        },
      )

      expect(req.flash).toHaveBeenCalledWith('appointmentForm', req.body)

      expect(locationDetailsService.getLocationMappingUsingDpsLocationId).toHaveBeenCalledWith(
        req.middleware.clientToken,
        formBody.location,
      )

      expect(res.redirect).toHaveBeenCalledWith(
        `/prisoner/${PrisonerMockDataA.prisonerNumber}/appointment-confirmation`,
      )
    })

    // Check when BVLS feature toggles are removed - blvsMasterPublicPrivateNotesEnabled and blvsHmctsLinkGuestPinEnabled

    it('should redirect to VLB page', async () => {
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

      await controller.post()(req, res)

      expect(controller['appointmentService'].createAppointments).not.toHaveBeenCalled()

      expect(req.flash).toHaveBeenCalledWith('prePostAppointmentDetails', {
        appointmentDefaults: { ...appointmentsToCreate, locationId: 1234, appointmentType: 'VLB' },
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
  })

  it('should display appointment confirmation', async () => {
    const { prisonerNumber } = PrisonerMockDataA

    req.flash = () => [formBody]

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

  // Check when BVLS feature toggles are removed - blvsMasterPublicPrivateNotesEnabled and blvsHmctsLinkGuestPinEnabled

  it('should display prepost appointment', async () => {
    const { prisonerNumber, cellLocation } = PrisonerMockDataA
    formBody.location = locationsMock[0].locationId

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
      miniBannerData: {
        prisonerName: 'Saunders, John',
        prisonerNumber,
        cellLocation: formatLocation(cellLocation),
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

    await controller.displayPrePostAppointments()(req, res)

    expect(controller['appointmentService'].getPrePostAppointmentRefData).toHaveBeenCalledWith(
      req.middleware.clientToken,
      res.locals.user.activeCaseLoadId,
    )
    expect(res.render).toHaveBeenCalledWith('pages/appointments/prePostAppointments', {
      pageTitle: 'Video link booking details',
      ...appointmentData,
      courts: courtLocationsSelectOptionsMock,
      locations: locationsApiSelectOptionsMock,
      refererUrl: `/prisoner/${prisonerNumber}`,
      errors: [],
      hearingTypes: courtHearingTypesSelectOptions,
    })
  })

  // Check when BVLS feature toggles are removed - blvsMasterPublicPrivateNotesEnabled and blvsHmctsLinkGuestPinEnabled

  it('should display prepost appointment with data prepopulated when editing', async () => {
    req.params.appointmentId = 1
    appointmentService.getAppointment = jest.fn().mockResolvedValue(vlbAppointmentMock)
    appointmentService.getVideoLinkBooking = jest.fn().mockResolvedValue(courtBookingMock)

    const { prisonerNumber, cellLocation } = PrisonerMockDataA
    formBody.location = locationsMock[0].locationId

    const flash = {
      appointmentDefaults: {
        locationId: formBody.location,
        startTime: formatDateTimeISO(
          set(new Date(today), { hours: formBody.startTimeHours, minutes: formBody.startTimeMinutes }),
        ),
      },
      appointmentForm: formBody,
    }
    req.flash = (key: string) => {
      if (key === 'prePostAppointmentDetails') {
        return [flash]
      }
      return []
    }

    const appointmentData = {
      appointmentId: 1,
      miniBannerData: {
        prisonerName: 'Saunders, John',
        prisonerNumber,
        cellLocation: formatLocation(cellLocation),
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

    await controller.displayPrePostAppointments()(req, res)

    expect(controller['appointmentService'].getPrePostAppointmentRefData).toHaveBeenCalledWith(
      req.middleware.clientToken,
      res.locals.user.activeCaseLoadId,
    )
    expect(res.render).toHaveBeenCalledWith('pages/appointments/prePostAppointments', {
      pageTitle: 'Change appointment details',
      ...appointmentData,
      courts: courtLocationsSelectOptionsMock,
      locations: locationsApiSelectOptionsMock,
      refererUrl: `/prisoner/${prisonerNumber}`,
      errors: [],
      hearingTypes: courtHearingTypesSelectOptions,
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

    // Check when BVLS feature toggles are removed - blvsMasterPublicPrivateNotesEnabled and blvsHmctsLinkGuestPinEnabled

    it('should create new video link booking appointment', async () => {
      const flash = {
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
      }
      req.flash = (key: string) => {
        if (key === 'postVLBDetails') {
          return [flash]
        }
        return []
      }

      locationDetailsService.getLocation = jest.fn(async () => ({
        id: 'location-1',
        key: 'ABC',
        localName: 'Local name one',
      }))

      await controller.postVideoLinkBooking()(req, res)

      expect(controller['appointmentService'].addVideoLinkBooking).toHaveBeenCalledWith(req.middleware.clientToken, {
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
        `/prisoner/${PrisonerMockDataA.prisonerNumber}/prepost-appointment-confirmation`,
      )
    })

    // Check when BVLS feature toggles are removed - blvsMasterPublicPrivateNotesEnabled and blvsHmctsLinkGuestPinEnabled

    it('should amend the existing video link booking appointment', async () => {
      const flash = {
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
      }
      req.flash = (key: string) => {
        if (key === 'postVLBDetails') {
          return [flash]
        }
        return []
      }

      appointmentService.getAppointment = jest.fn().mockResolvedValue(vlbAppointmentMock)
      appointmentService.getVideoLinkBooking = jest.fn().mockResolvedValue(courtBookingMock)

      locationDetailsService.getLocation = jest.fn(async () => ({
        id: 'location-1',
        key: 'ABC',
        localName: 'Local name one',
      }))

      await controller.postVideoLinkBooking()(req, res)

      expect(controller['appointmentService'].amendVideoLinkBooking).toHaveBeenCalledWith(
        req.middleware.clientToken,
        1,
        {
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
        },
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

  // Check when BVLS feature toggles are removed - blvsMasterPublicPrivateNotesEnabled and blvsHmctsLinkGuestPinEnabled

  it('should display prepost appointment confirmation', async () => {
    const { prisonerNumber } = PrisonerMockDataA
    const flash = {
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

    await controller.displayPrePostAppointmentConfirmation()(req, res)

    expect(controller['appointmentService'].getPrePostAppointmentRefData).toHaveBeenCalledWith(
      req.middleware.clientToken,
      res.locals.user.activeCaseLoadId,
    )
    expect(controller['appointmentService'].getAgencyDetails).toHaveBeenCalled()
    expect(res.render).toHaveBeenCalledWith('pages/appointments/prePostAppointmentConfirmation', {
      pageTitle: 'The video link has been booked',
      ...appointmentData,
      profileUrl: `/prisoner/${prisonerNumber}`,
      movementSlipUrl: `/prisoner/${prisonerNumber}/movement-slips`,
      videoLinkUrl: 'http://bvls.test.url',
      mustContactTheCourt: true,
    })
  })

  // Check when BVLS feature toggles are removed - blvsMasterPublicPrivateNotesEnabled and blvsHmctsLinkGuestPinEnabled

  it('should display prepost appointment confirmation when amending', async () => {
    const { prisonerNumber } = PrisonerMockDataA
    const flash = {
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
    }

    req.flash = (key: string) => {
      if (key === 'prePostAppointmentDetails') {
        return [flash]
      }
      return []
    }
    const appointmentData = {
      appointmentType: 'Video Link - Court Hearing',
      appointmentTypeCode: 'VLB',
      prisonerName: 'John Saunders',
      prisonerNumber,
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

    await controller.displayPrePostAppointmentConfirmation()(req, res)

    expect(controller['appointmentService'].getPrePostAppointmentRefData).toHaveBeenCalledWith(
      req.middleware.clientToken,
      res.locals.user.activeCaseLoadId,
    )
    expect(controller['appointmentService'].getAgencyDetails).toHaveBeenCalled()
    expect(res.render).toHaveBeenCalledWith('pages/appointments/prePostAppointmentConfirmation', {
      pageTitle: 'The video link has been updated',
      ...appointmentData,
      profileUrl: `/prisoner/${prisonerNumber}`,
      movementSlipUrl: `/prisoner/${prisonerNumber}/movement-slips`,
      videoLinkUrl: 'http://bvls.test.url',
      mustContactTheCourt: true,
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

  it('should get location by id', async () => {
    req.query.date = '01/01/2023'
    req.query.locationId = locationsApiMock[0].id

    locationDetailsService.getLocation = jest.fn().mockResolvedValue({ id: 'location-1' })

    locationDetailsService.getLocationMappingUsingDpsLocationId = jest.fn().mockResolvedValue({
      nomisLocationId: 1234,
      dpsLocationId: 'location-1',
    })

    await controller.getLocationExistingEvents()(req, res)
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

    await controller.getLocationExistingEvents()(req, res)

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
    req.query.times = 5
    const endDate = formatDate(dateToIsoDate('06/01/2023'), 'full')

    await controller.getRecurringEndDate()(req, res)

    expect(res.send).toHaveBeenCalledWith(endDate)
  })
})
