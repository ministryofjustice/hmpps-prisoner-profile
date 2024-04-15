import AppointmentService from './appointmentService'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { WhereaboutsApiClient } from '../data/interfaces/whereaboutsApi/whereaboutsApiClient'
import { appointmentTypesMock } from '../data/localMockData/appointmentTypesMock'
import { prisonApiClientMock } from '../../tests/mocks/prisonApiClientMock'
import { locationsMock } from '../data/localMockData/locationsMock'
import { courtLocationsMock } from '../data/localMockData/courtLocationsMock'
import { appointmentMock } from '../data/localMockData/appointmentMock'
import { videoLinkBookingMock } from '../data/localMockData/videoLinkBookingMock'
import { offenderSentenceDetailsMock } from '../data/localMockData/offenderSentenceDetailsMock'
import { courtEventPrisonerSchedulesMock, prisonerSchedulesMock } from '../data/localMockData/prisonerSchedulesMock'
import AgenciesMock from '../data/localMockData/agenciesDetails'
import { ManageUsersApiClient } from '../data/interfaces/manageUsersApi/manageUsersApiClient'
import { userEmailDataMock } from '../data/localMockData/userEmailDataMock'

jest.mock('../data/prisonApiClient')
jest.mock('../data/whereaboutsClient')

describe('Appointment Service', () => {
  let appointmentService: AppointmentService
  let prisonApiClient: PrisonApiClient
  let whereaboutsApiClient: WhereaboutsApiClient
  let manageUsersApiClient: ManageUsersApiClient

  beforeEach(() => {
    prisonApiClient = {
      ...prisonApiClientMock(),
      getAppointmentTypes: jest.fn(async () => appointmentTypesMock),
      getLocationsForAppointments: jest.fn(async () => locationsMock),
      getSentenceData: jest.fn(async () => offenderSentenceDetailsMock),
      getCourtEvents: jest.fn(async () => courtEventPrisonerSchedulesMock),
      getVisits: jest.fn(async () => prisonerSchedulesMock),
      getAppointments: jest.fn(async () => prisonerSchedulesMock),
      getExternalTransfers: jest.fn(async () => prisonerSchedulesMock),
      getActivities: jest.fn(async () => prisonerSchedulesMock),
      getLocation: jest.fn(async () => locationsMock[0]),
      getActivitiesAtLocation: jest.fn(async () => prisonerSchedulesMock),
      getActivityList: jest.fn(async () => prisonerSchedulesMock),
      getAgencyDetails: jest.fn(async () => AgenciesMock),
    }
    whereaboutsApiClient = {
      getCourts: jest.fn(async () => courtLocationsMock),
      createAppointments: jest.fn(async () => appointmentMock),
      addVideoLinkBooking: jest.fn(async () => 12345),
      getCellMoveReason: jest.fn(),
      getUnacceptableAbsences: jest.fn(),
    }
    manageUsersApiClient = {
      getUser: jest.fn(),
      getUserEmail: jest.fn(async () => userEmailDataMock),
    }
    appointmentService = new AppointmentService(
      () => prisonApiClient,
      () => whereaboutsApiClient,
      () => manageUsersApiClient,
    )
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('getAddAppointmentRefData', () => {
    it('should call API to get ref data', async () => {
      const refData = await appointmentService.getAddAppointmentRefData('', 'MDI')

      expect(prisonApiClient.getAppointmentTypes).toHaveBeenCalled()
      expect(prisonApiClient.getLocationsForAppointments).toHaveBeenCalled()
      expect(refData).toEqual({ appointmentTypes: appointmentTypesMock, locations: locationsMock })
    })
  })

  describe('getPrePostAppointmentRefData', () => {
    it('should call API to get ref data', async () => {
      const refData = await appointmentService.getPrePostAppointmentRefData('', 'MDI')

      expect(whereaboutsApiClient.getCourts).toHaveBeenCalled()
      expect(prisonApiClient.getLocationsForAppointments).toHaveBeenCalled()
      expect(refData).toEqual({ courts: courtLocationsMock, locations: locationsMock })
    })
  })

  describe('createAppointments', () => {
    it('should call API to create appointment', async () => {
      const response = await appointmentService.createAppointments('', appointmentMock)

      expect(whereaboutsApiClient.createAppointments).toHaveBeenCalledWith(appointmentMock)
      expect(response).toEqual(appointmentMock)
    })
  })

  describe('addVideoLinkBooking', () => {
    it('should call API to create video link booking', async () => {
      const response = await appointmentService.addVideoLinkBooking('', videoLinkBookingMock)

      expect(whereaboutsApiClient.addVideoLinkBooking).toHaveBeenCalledWith(videoLinkBookingMock)
      expect(response).toEqual(12345)
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

  describe('getLocation', () => {
    it('should call API to get location', async () => {
      const response = await appointmentService.getLocation('', 27000)

      expect(prisonApiClient.getLocation).toHaveBeenCalledWith(27000)
      expect(response).toEqual(locationsMock[0])
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

  describe('getUserEmail', () => {
    it('should call API to get user email', async () => {
      const response = await manageUsersApiClient.getUserEmail('username')

      expect(manageUsersApiClient.getUserEmail).toHaveBeenCalledWith('username')
      expect(response).toEqual(userEmailDataMock)
    })
  })
})
