import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import { WhereaboutsApiClient } from '../data/interfaces/whereaboutsApi/whereaboutsApiClient'
import ReferenceCode from '../data/interfaces/prisonApi/ReferenceCode'
import CourtHearingOrMeetingType from '../data/interfaces/bookAVideoLinkApi/ReferenceCode'
import { AppointmentDefaults, AppointmentDetails } from '../data/interfaces/whereaboutsApi/Appointment'
import { timeFormat } from '../utils/dateHelpers'
import { sortByDateTime } from '../utils/utils'
import { AgencyDetails } from '../data/interfaces/prisonApi/Agency'
import { BookAVideoLinkApiClient } from '../data/interfaces/bookAVideoLinkApi/bookAVideoLinkApiClient'
import CreateVideoBookingRequest, {
  AmendVideoBookingRequest,
  VideoBookingSearchRequest,
  VideoLinkBooking,
} from '../data/interfaces/bookAVideoLinkApi/VideoLinkBooking'
import Court, { ProbationTeam } from '../data/interfaces/bookAVideoLinkApi/Court'
import LocationDetailsService from './locationDetailsService'
import LocationsApiLocation from '../data/interfaces/locationsInsidePrisonApi/LocationsApiLocation'

export interface AddAppointmentRefData {
  appointmentTypes: ReferenceCode[]
  locations: LocationsApiLocation[]
  probationTeams: ProbationTeam[]
  meetingTypes: CourtHearingOrMeetingType[]
}

export interface PrePostAppointmentRefData {
  courts: Court[]
  probationTeams: ProbationTeam[]
  hearingTypes: CourtHearingOrMeetingType[]
  meetingTypes: CourtHearingOrMeetingType[]
  locations: LocationsApiLocation[]
}

export interface OffenderEvent {
  eventDescription: string
  offenderNo?: string
  locationId?: number
  eventLocation?: string
  startTime?: string
  endTime?: string
  start?: string
  end?: string
  comment?: string
}

export interface GenericEvent {
  eventDescription: string
  offenderNo?: string
  locationId?: number
  eventLocation?: string
  startTime: string
  endTime?: string
  comment?: string
  eventStatus?: string
}

const getEventDescription = ({ eventDescription, eventLocation, comment }: Partial<GenericEvent>) => {
  const description = eventDescription === 'Prison Activities' ? 'Activity' : eventDescription
  const locationString = eventLocation ? `${eventLocation} - ` : ''
  const descriptionString = comment ? `${description} - ${comment}` : eventDescription

  return `${locationString}${descriptionString}`
}

const toEvent = (event: GenericEvent): OffenderEvent => ({
  ...event,
  startTime: timeFormat(event.startTime),
  endTime: event.endTime && timeFormat(event.endTime),
  start: event.startTime,
  end: event.endTime,
  eventDescription: getEventDescription(event),
})

export default class AppointmentService {
  constructor(
    private readonly locationDetailsService: LocationDetailsService,
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly whereaboutsApiClientBuilder: RestClientBuilder<WhereaboutsApiClient>,
    private readonly bookAVideoLinkApiClientBuilder: RestClientBuilder<BookAVideoLinkApiClient>,
  ) {}

  /**
   * Handle request for add appointment ref data
   *
   * @param token
   * @param prisonId
   */
  public async getAddAppointmentRefData(token: string, prisonId: string): Promise<AddAppointmentRefData> {
    const [appointmentTypes, locations, probationTeams, meetingTypes] = await Promise.all([
      this.prisonApiClientBuilder(token).getAppointmentTypes(),
      this.locationDetailsService.getLocationsForAppointments(token, prisonId),
      this.bookAVideoLinkApiClientBuilder(token).getProbationTeams(),
      this.bookAVideoLinkApiClientBuilder(token).getProbationMeetingTypes(),
    ])

    return {
      appointmentTypes,
      locations,
      probationTeams,
      meetingTypes,
    }
  }

  /**
   * Handle request for pre post appointment ref data
   *
   * @param token
   * @param prisonId
   */
  public async getPrePostAppointmentRefData(token: string, prisonId: string): Promise<PrePostAppointmentRefData> {
    const [courts, probationTeams, hearingTypes, meetingTypes, locations] = await Promise.all([
      this.bookAVideoLinkApiClientBuilder(token).getCourts(),
      [],
      this.bookAVideoLinkApiClientBuilder(token).getCourtHearingTypes(),
      [],
      this.locationDetailsService.getLocationsForAppointments(token, prisonId),
    ])

    return {
      courts,
      probationTeams,
      hearingTypes,
      meetingTypes,
      locations,
    }
  }

  public async createAppointments(token: string, appointments: AppointmentDefaults): Promise<unknown> {
    return this.whereaboutsApiClientBuilder(token).createAppointments(appointments)
  }

  public async getAppointment(token: string, appointmentId: number): Promise<AppointmentDetails> {
    return this.whereaboutsApiClientBuilder(token).getAppointment(appointmentId)
  }

  public async addVideoLinkBooking(token: string, videoLinkBookingForm: CreateVideoBookingRequest): Promise<number> {
    return this.bookAVideoLinkApiClientBuilder(token).addVideoLinkBooking(videoLinkBookingForm)
  }

  public async amendVideoLinkBooking(
    token: string,
    videoBookingId: number,
    videoLinkBookingForm: AmendVideoBookingRequest,
  ): Promise<void> {
    return this.bookAVideoLinkApiClientBuilder(token).amendVideoLinkBooking(videoBookingId, videoLinkBookingForm)
  }

  public async getVideoLinkBooking(token: string, searchRequest: VideoBookingSearchRequest): Promise<VideoLinkBooking> {
    return this.bookAVideoLinkApiClientBuilder(token).getVideoLinkBooking(searchRequest)
  }

  public async getExistingEventsForOffender(
    token: string,
    agencyId: string,
    date: string,
    offenderNo: string,
  ): Promise<OffenderEvent[]> {
    const offenderNumbers = [offenderNo]

    const [sentenceData, courtEvents, ...rest] = await Promise.all([
      this.prisonApiClientBuilder(token).getSentenceData(offenderNumbers),
      this.prisonApiClientBuilder(token).getCourtEvents(offenderNumbers, agencyId, date),
      this.prisonApiClientBuilder(token).getVisits(offenderNumbers, agencyId, date),
      this.prisonApiClientBuilder(token).getAppointments(offenderNumbers, agencyId, date),
      this.prisonApiClientBuilder(token).getExternalTransfers(offenderNumbers, agencyId, date),
      this.prisonApiClientBuilder(token).getActivities(offenderNumbers, agencyId, date),
    ])

    const hasCourtVisit = courtEvents.length && courtEvents.some((event: GenericEvent) => event.eventStatus === 'SCH')

    const isReleaseDate = sentenceData.length && sentenceData[0].sentenceDetail.releaseDate === date

    const otherEvents = rest.reduce((flattenedEvents: object[], event: object[]) => flattenedEvents.concat(event), [])

    const formattedEvents: OffenderEvent[] = otherEvents
      .sort((left: GenericEvent, right: GenericEvent) => sortByDateTime(left.startTime, right.startTime))
      .map(toEvent)

    if (hasCourtVisit) formattedEvents.unshift({ eventDescription: '**Court visit scheduled**' })

    if (isReleaseDate) formattedEvents.unshift({ eventDescription: '**Due for release**' })

    return formattedEvents
  }

  public async getExistingEventsForLocation(
    token: string,
    agencyId: string,
    locationId: number,
    date: string,
  ): Promise<OffenderEvent[]> {
    const eventsAtLocationByUsage = await Promise.all([
      this.prisonApiClientBuilder(token).getActivitiesAtLocation(locationId, date),
      this.prisonApiClientBuilder(token).getActivityList(agencyId, locationId, 'VISIT', date),
      this.prisonApiClientBuilder(token).getActivityList(agencyId, locationId, 'APP', date),
    ]).then(events => events.reduce((flattenedEvents, event) => flattenedEvents.concat(event), []))

    return eventsAtLocationByUsage.sort((left, right) => sortByDateTime(left.startTime, right.startTime)).map(toEvent)
  }

  public async getAgencyDetails(token: string, agencyId: string): Promise<AgencyDetails> {
    return this.prisonApiClientBuilder(token).getAgencyDetails(agencyId)
  }
}
