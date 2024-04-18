import { RestClientBuilder } from '../data'
import OverviewSchedule, { OverviewScheduleItem } from './interfaces/scheduleService/OverviewSchedule'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import ScheduledEvent from '../data/interfaces/prisonApi/ScheduledEvent'
import { formatScheduledEventTime } from '../utils/formatScheduledEventTime'
import groupEventsByPeriod from '../utils/groupEventsByPeriod'

export default class PrisonerScheduleService {
  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  private formatEventForOverview = (event: ScheduledEvent): OverviewScheduleItem => {
    const name = event.eventSubType === 'PA' ? event.eventSourceDesc : event.eventSubTypeDesc
    const { startTime, endTime } = formatScheduledEventTime(event)

    return {
      name,
      startTime,
      endTime,
    }
  }

  async getScheduleOverview(clientToken: string, bookingId: number): Promise<OverviewSchedule> {
    const prisonApiClient = this.prisonApiClientBuilder(clientToken)

    const scheduledEvents = await prisonApiClient.getEventsScheduledForToday(bookingId)
    const groupedEvents = groupEventsByPeriod(scheduledEvents)

    return {
      morning: groupedEvents.morningEvents.map(this.formatEventForOverview),
      afternoon: groupedEvents.afternoonEvents.map(this.formatEventForOverview),
      evening: groupedEvents.eveningEvents.map(this.formatEventForOverview),
    }
  }
}
