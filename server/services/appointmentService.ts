import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { WhereaboutsApiClient } from '../data/interfaces/whereaboutsApiClient'
import { ReferenceCode } from '../interfaces/prisonApi/referenceCode'
import { AppointmentDefaults } from '../interfaces/whereaboutsApi/appointment'
import { timeFormat } from '../utils/dateHelpers'
import { sortByDateTime } from '../utils/utils'
import { Location } from '../interfaces/prisonApi/location'
import { CourtLocation } from '../interfaces/whereaboutsApi/courtLocation'
import { VideoLinkBookingForm } from '../interfaces/whereaboutsApi/videoLinkBooking'
import { AgencyLocationDetails } from '../interfaces/prisonApi/agencies'

export interface AddAppointmentRefData {
  appointmentTypes: ReferenceCode[]
  locations: Location[]
}

export interface PrePostAppointmentRefData {
  locations: Location[]
  courts: CourtLocation[]
}

export interface OffenderEvent {
  eventDescription: string
  eventLocation?: string
  startTime?: string
  endTime?: string
  start?: string
  end?: string
  comment?: string
}

export interface GenericEvent {
  eventDescription: string
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
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly whereaboutsApiClientBuilder: RestClientBuilder<WhereaboutsApiClient>,
  ) {}

  /**
   * Handle request for add appointment ref data
   *
   * @param token
   * @param prisonId
   */
  public async getAddAppointmentRefData(token: string, prisonId: string): Promise<AddAppointmentRefData> {
    const [appointmentTypes, locations] = await Promise.all([
      this.prisonApiClientBuilder(token).getAppointmentTypes(),
      this.prisonApiClientBuilder(token).getLocationsForAppointments(prisonId),
    ])

    return {
      appointmentTypes,
      locations,
    }
  }

  /**
   * Handle request for pre post appointment ref data
   *
   * @param token
   * @param prisonId
   */
  public async getPrePostAppointmentRefData(token: string, prisonId: string): Promise<PrePostAppointmentRefData> {
    const [courts, locations] = await Promise.all([
      this.whereaboutsApiClientBuilder(token).getCourts(),
      this.prisonApiClientBuilder(token).getLocationsForAppointments(prisonId),
    ])

    return {
      courts,
      locations,
    }
  }

  public async createAppointments(token: string, appointments: AppointmentDefaults): Promise<unknown> {
    return this.whereaboutsApiClientBuilder(token).createAppointments(appointments)
  }

  public async addVideoLinkBooking(token: string, videoLinkBookingForm: VideoLinkBookingForm): Promise<unknown> {
    return this.whereaboutsApiClientBuilder(token).addVideoLinkBooking(videoLinkBookingForm)
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

  public async getLocation(token: string, locationId: number): Promise<Location> {
    return this.prisonApiClientBuilder(token).getLocation(locationId)
  }

  public async getExistingEventsForLocation(token: string, agencyId: string, locationId: number, date: string) {
    const eventsAtLocationByUsage = await Promise.all([
      this.prisonApiClientBuilder(token).getActivitiesAtLocation(locationId, date),
      this.prisonApiClientBuilder(token).getActivityList(agencyId, locationId, 'VISIT', date),
      this.prisonApiClientBuilder(token).getActivityList(agencyId, locationId, 'APP', date),
    ]).then(events => events.reduce((flattenedEvents, event) => flattenedEvents.concat(event), []))

    return eventsAtLocationByUsage.sort((left, right) => sortByDateTime(left.startTime, right.startTime)).map(toEvent)
  }

  public async getAgencyDetails(token: string, agencyId: string): Promise<AgencyLocationDetails> {
    return this.prisonApiClientBuilder(token).getAgencyDetails(agencyId)
  }
}
