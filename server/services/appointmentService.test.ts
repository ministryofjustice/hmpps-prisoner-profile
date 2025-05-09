import AppointmentService from './appointmentService'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { WhereaboutsApiClient } from '../data/interfaces/whereaboutsApi/whereaboutsApiClient'
import { appointmentTypesMock } from '../data/localMockData/appointmentTypesMock'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { locationsApiMock } from '../data/localMockData/locationsMock'
import { courtLocationsMock, probationTeamsMock } from '../data/localMockData/courtLocationsMock'
import { appointmentMock } from '../data/localMockData/appointmentMock'
import { offenderSentenceDetailsMock } from '../data/localMockData/offenderSentenceDetailsMock'
import { courtEventPrisonerSchedulesMock, prisonerSchedulesMock } from '../data/localMockData/prisonerSchedulesMock'
import AgenciesMock from '../data/localMockData/agenciesDetails'
import { BookAVideoLinkApiClient } from '../data/interfaces/bookAVideoLinkApi/bookAVideoLinkApiClient'
import { courtHearingTypes, probationMeetingTypes } from '../data/localMockData/courtHearingsMock'
import CreateVideoBookingRequest, {
  AmendVideoBookingRequest,
  VideoBookingSearchRequest,
} from '../data/interfaces/bookAVideoLinkApi/VideoLinkBooking'
import LocationDetailsService from './locationDetailsService'

jest.mock('../data/prisonApiClient')
jest.mock('../data/whereaboutsClient')
jest.mock('./locationDetailsService')

describe('Appointment Service', () => {
  let appointmentService: AppointmentService
  let locationDetailsService: LocationDetailsService
  let prisonApiClient: PrisonApiClient
  let whereaboutsApiClient: WhereaboutsApiClient
  let bookAVideoLinkApiClient: BookAVideoLinkApiClient

  beforeEach(() => {
    prisonApiClient = {
      ...prisonApiClientMock(),
      getAppointmentTypes: jest.fn(async () => appointmentTypesMock),
      getSentenceData: jest.fn(async () => offenderSentenceDetailsMock),
      getCourtEvents: jest.fn(async () => courtEventPrisonerSchedulesMock),
      getVisits: jest.fn(async () => prisonerSchedulesMock),
      getAppointments: jest.fn(async () => prisonerSchedulesMock),
      getExternalTransfers: jest.fn(async () => prisonerSchedulesMock),
      getActivities: jest.fn(async () => prisonerSchedulesMock),
      getActivitiesAtLocation: jest.fn(async () => prisonerSchedulesMock),
      getActivityList: jest.fn(async () => prisonerSchedulesMock),
      getAgencyDetails: jest.fn(async () => AgenciesMock),
    }
    whereaboutsApiClient = {
      getAppointment: jest.fn(),
      createAppointments: jest.fn(async () => appointmentMock),
      getCellMoveReason: jest.fn(),
      getUnacceptableAbsences: jest.fn(),
    }
    bookAVideoLinkApiClient = {
      addVideoLinkBooking: jest.fn(async () => 12345),
      amendVideoLinkBooking: jest.fn(),
      getVideoLinkBooking: jest.fn(),
      getProbationTeams: jest.fn(async () => probationTeamsMock),
      getCourts: jest.fn(async () => courtLocationsMock),
      getCourtHearingTypes: jest.fn(async () => courtHearingTypes),
      getProbationMeetingTypes: jest.fn(async () => probationMeetingTypes),
    }

    locationDetailsService = new LocationDetailsService(null, null, null) as jest.Mocked<LocationDetailsService>

    appointmentService = new AppointmentService(
      locationDetailsService,
      () => prisonApiClient,
      () => whereaboutsApiClient,
      () => bookAVideoLinkApiClient,
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getAddAppointmentRefData - bvls', () => {
    it('should call API to get ref data', async () => {
      locationDetailsService.getLocationsForAppointments = jest.fn().mockResolvedValue(locationsApiMock)
      const refData = await appointmentService.getAddAppointmentRefData('', 'MDI')

      expect(prisonApiClient.getAppointmentTypes).toHaveBeenCalled()
      expect(locationDetailsService.getLocationsForAppointments).toHaveBeenCalledWith('', 'MDI')

      expect(bookAVideoLinkApiClient.getProbationTeams).toHaveBeenCalled()
      expect(bookAVideoLinkApiClient.getProbationMeetingTypes).toHaveBeenCalled()
      expect(refData).toEqual({
        appointmentTypes: appointmentTypesMock,
        locations: locationsApiMock,
        probationTeams: probationTeamsMock,
        meetingTypes: probationMeetingTypes,
      })
    })
  })

  describe('getPrePostAppointmentRefData - bvls', () => {
    it('should call API to get ref data', async () => {
      locationDetailsService.getLocationsForAppointments = jest.fn().mockResolvedValue(locationsApiMock)
      const refData = await appointmentService.getPrePostAppointmentRefData('', 'MDI')

      expect(bookAVideoLinkApiClient.getCourts).toHaveBeenCalled()
      expect(bookAVideoLinkApiClient.getCourtHearingTypes).toHaveBeenCalled()
      expect(locationDetailsService.getLocationsForAppointments).toHaveBeenCalled()

      expect(bookAVideoLinkApiClient.getProbationTeams).not.toHaveBeenCalled()
      expect(bookAVideoLinkApiClient.getProbationMeetingTypes).not.toHaveBeenCalled()
      expect(refData).toEqual({
        courts: courtLocationsMock,
        hearingTypes: courtHearingTypes,
        probationTeams: [],
        meetingTypes: [],
        locations: locationsApiMock,
      })
    })
  })

  describe('createAppointments', () => {
    it('should call API to create appointment', async () => {
      const response = await appointmentService.createAppointments('', appointmentMock)

      expect(whereaboutsApiClient.createAppointments).toHaveBeenCalledWith(appointmentMock)
      expect(response).toEqual(appointmentMock)
    })
  })

  describe('getAppointment', () => {
    it('should call API to fetch an appointment', async () => {
      whereaboutsApiClient.getAppointment = jest.fn().mockResolvedValue(appointmentMock)
      const response = await appointmentService.getAppointment('', 1)

      expect(whereaboutsApiClient.getAppointment).toHaveBeenCalledWith(1)
      expect(response).toEqual(appointmentMock)
    })
  })

  describe('addVideoLinkBooking', () => {
    it('should call API to create video link booking', async () => {
      const response = await appointmentService.addVideoLinkBooking('', {
        bookingType: 'COURT',
      } as CreateVideoBookingRequest)

      expect(bookAVideoLinkApiClient.addVideoLinkBooking).toHaveBeenCalledWith({ bookingType: 'COURT' })
      expect(response).toEqual(12345)
    })
  })

  describe('amendVideoLinkBooking', () => {
    it('should call API to amend a video link booking', async () => {
      await appointmentService.amendVideoLinkBooking('', 1, {
        bookingType: 'COURT',
      } as AmendVideoBookingRequest)

      expect(bookAVideoLinkApiClient.amendVideoLinkBooking).toHaveBeenCalledWith(1, { bookingType: 'COURT' })
    })
  })

  describe('getVideoLinkBooking', () => {
    it('should call API to get a video link booking', async () => {
      bookAVideoLinkApiClient.getVideoLinkBooking = jest.fn().mockResolvedValue({ bookingType: 'COURT' })
      const response = await appointmentService.getVideoLinkBooking('', {
        prisonerNumber: 'abc123',
      } as VideoBookingSearchRequest)

      expect(bookAVideoLinkApiClient.getVideoLinkBooking).toHaveBeenCalled()
      expect(response).toEqual({ bookingType: 'COURT' })
    })
  })

  describe('getExistingEventsForOffender', () => {
    it('should call API to get events', async () => {
      const response = await appointmentService.getExistingEventsForOffender('', 'MDI', '2023-01-01', 'A1234BC')

      expect(prisonApiClient.getSentenceData).toHaveBeenCalled()
      expect(prisonApiClient.getCourtEvents).toHaveBeenCalled()
      expect(prisonApiClient.getVisits).toHaveBeenCalled()
      expect(prisonApiClient.getAppointments).toHaveBeenCalled()
      expect(prisonApiClient.getExternalTransfers).toHaveBeenCalled()
      expect(prisonApiClient.getActivities).toHaveBeenCalled()
      expect(response).toEqual([
        {
          eventDescription: '**Due for release**',
        },
        {
          eventDescription: '**Court visit scheduled**',
        },
        {
          bookingId: 1,
          cellLocation: '1',
          comment: 'Comment',
          end: '2023-01-01T11:00:00',
          endTime: '11:00',
          event: 'Event',
          eventDescription: 'Court - Court - Comment',
          eventId: 1,
          eventLocation: 'Court',
          eventLocationId: 1,
          eventOutcome: 'OK',
          eventStatus: 'ACTIVE',
          eventType: 'COURT',
          excluded: false,
          firstName: 'John',
          lastName: 'Saunders',
          locationCode: 'CODE',
          locationId: 1,
          offenderNo: 'G6123VU',
          outcomeComment: 'Comment',
          paid: false,
          payRate: 1,
          performance: 'Yes',
          start: '2023-01-01T10:00:00',
          startTime: '10:00',
          suspended: false,
          timeSlot: 'AM',
        },
        {
          bookingId: 1,
          cellLocation: '1',
          comment: 'Comment',
          end: '2023-01-01T11:00:00',
          endTime: '11:00',
          event: 'Event',
          eventDescription: 'Court - Court - Comment',
          eventId: 1,
          eventLocation: 'Court',
          eventLocationId: 1,
          eventOutcome: 'OK',
          eventStatus: 'ACTIVE',
          eventType: 'COURT',
          excluded: false,
          firstName: 'John',
          lastName: 'Saunders',
          locationCode: 'CODE',
          locationId: 1,
          offenderNo: 'G6123VU',
          outcomeComment: 'Comment',
          paid: false,
          payRate: 1,
          performance: 'Yes',
          start: '2023-01-01T10:00:00',
          startTime: '10:00',
          suspended: false,
          timeSlot: 'AM',
        },
        {
          bookingId: 1,
          cellLocation: '1',
          comment: 'Comment',
          end: '2023-01-01T11:00:00',
          endTime: '11:00',
          event: 'Event',
          eventDescription: 'Court - Court - Comment',
          eventId: 1,
          eventLocation: 'Court',
          eventLocationId: 1,
          eventOutcome: 'OK',
          eventStatus: 'ACTIVE',
          eventType: 'COURT',
          excluded: false,
          firstName: 'John',
          lastName: 'Saunders',
          locationCode: 'CODE',
          locationId: 1,
          offenderNo: 'G6123VU',
          outcomeComment: 'Comment',
          paid: false,
          payRate: 1,
          performance: 'Yes',
          start: '2023-01-01T10:00:00',
          startTime: '10:00',
          suspended: false,
          timeSlot: 'AM',
        },
        {
          bookingId: 1,
          cellLocation: '1',
          comment: 'Comment',
          end: '2023-01-01T11:00:00',
          endTime: '11:00',
          event: 'Event',
          eventDescription: 'Court - Court - Comment',
          eventId: 1,
          eventLocation: 'Court',
          eventLocationId: 1,
          eventOutcome: 'OK',
          eventStatus: 'ACTIVE',
          eventType: 'COURT',
          excluded: false,
          firstName: 'John',
          lastName: 'Saunders',
          locationCode: 'CODE',
          locationId: 1,
          offenderNo: 'G6123VU',
          outcomeComment: 'Comment',
          paid: false,
          payRate: 1,
          performance: 'Yes',
          start: '2023-01-01T10:00:00',
          startTime: '10:00',
          suspended: false,
          timeSlot: 'AM',
        },
      ])
    })
  })

  describe('getExistingEventsForLocation', () => {
    const agencyId = 'MDI'
    const locationId = 27000
    const date = '2023-01-01'
    it('should call API to get events for location', async () => {
      const response = await appointmentService.getExistingEventsForLocation('', agencyId, locationId, date)

      expect(prisonApiClient.getActivitiesAtLocation).toHaveBeenCalledWith(locationId, date)
      expect(prisonApiClient.getActivityList).toHaveBeenCalledWith(agencyId, locationId, 'VISIT', date)
      expect(prisonApiClient.getActivityList).toHaveBeenCalledWith(agencyId, locationId, 'APP', date)
      expect(response).toEqual([
        {
          bookingId: 1,
          cellLocation: '1',
          comment: 'Comment',
          end: '2023-01-01T11:00:00',
          endTime: '11:00',
          event: 'Event',
          eventDescription: 'Court - Court - Comment',
          eventId: 1,
          eventLocation: 'Court',
          eventLocationId: 1,
          eventOutcome: 'OK',
          eventStatus: 'ACTIVE',
          eventType: 'COURT',
          excluded: false,
          firstName: 'John',
          lastName: 'Saunders',
          locationCode: 'CODE',
          locationId: 1,
          offenderNo: 'G6123VU',
          outcomeComment: 'Comment',
          paid: false,
          payRate: 1,
          performance: 'Yes',
          start: '2023-01-01T10:00:00',
          startTime: '10:00',
          suspended: false,
          timeSlot: 'AM',
        },
        {
          bookingId: 1,
          cellLocation: '1',
          comment: 'Comment',
          end: '2023-01-01T11:00:00',
          endTime: '11:00',
          event: 'Event',
          eventDescription: 'Court - Court - Comment',
          eventId: 1,
          eventLocation: 'Court',
          eventLocationId: 1,
          eventOutcome: 'OK',
          eventStatus: 'ACTIVE',
          eventType: 'COURT',
          excluded: false,
          firstName: 'John',
          lastName: 'Saunders',
          locationCode: 'CODE',
          locationId: 1,
          offenderNo: 'G6123VU',
          outcomeComment: 'Comment',
          paid: false,
          payRate: 1,
          performance: 'Yes',
          start: '2023-01-01T10:00:00',
          startTime: '10:00',
          suspended: false,
          timeSlot: 'AM',
        },
        {
          bookingId: 1,
          cellLocation: '1',
          comment: 'Comment',
          end: '2023-01-01T11:00:00',
          endTime: '11:00',
          event: 'Event',
          eventDescription: 'Court - Court - Comment',
          eventId: 1,
          eventLocation: 'Court',
          eventLocationId: 1,
          eventOutcome: 'OK',
          eventStatus: 'ACTIVE',
          eventType: 'COURT',
          excluded: false,
          firstName: 'John',
          lastName: 'Saunders',
          locationCode: 'CODE',
          locationId: 1,
          offenderNo: 'G6123VU',
          outcomeComment: 'Comment',
          paid: false,
          payRate: 1,
          performance: 'Yes',
          start: '2023-01-01T10:00:00',
          startTime: '10:00',
          suspended: false,
          timeSlot: 'AM',
        },
      ])
    })
  })

  describe('getAgencyDetails', () => {
    it('should call API to get location', async () => {
      const response = await appointmentService.getAgencyDetails('', 'MDI')

      expect(prisonApiClient.getAgencyDetails).toHaveBeenCalledWith('MDI')
      expect(response).toEqual(AgenciesMock)
    })
  })
})
