import { Request, Response } from 'express'
import { add, format, getHours, isAfter, isBefore, startOfToday } from 'date-fns'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApiClient'
import { Prisoner } from '../interfaces/prisoner'
import { mapHeaderNoBannerData } from '../mappers/headerMappers'
import { formatName, groupBy, times } from '../utils/utils'
import { formatDate } from '../utils/dateHelpers'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import { GetEventScheduleItem } from '../interfaces/prisonApi/getEventScheduleItem'

/**
 * Parse requests for case notes routes and orchestrate response
 */

export default class PrisonerScheduleController {
  private prisonApiClient: PrisonApiClient

  constructor(private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>) {}

  public async displayPrisonerSchedule(req: Request, res: Response, prisonerData: Prisoner) {
    const { firstName, middleNames, lastName } = prisonerData
    const name = formatName(firstName, middleNames, lastName, { style: NameFormatStyle.firstLast })

    const { clientToken } = res.locals
    this.prisonApiClient = this.prisonApiClientBuilder(clientToken)

    let schedule: GetEventScheduleItem[]
    const { when } = req.query

    const { bookingId } = prisonerData

    if (when === 'nextWeek') {
      schedule = await this.prisonApiClient.getScheduledEventsForNextWeek(bookingId)
    } else {
      schedule = await this.prisonApiClient.getScheduledEventsForThisWeek(bookingId)
    }

    const groupedByDate = groupBy(schedule, 'eventDate')
    const oneWeekToday = format(add(startOfToday(), { weeks: 1 }), 'yyyy-MM-dd')
    const selectedWeekDates: { date: string }[] = []

    if (when === 'nextWeek') {
      times(7)((i: number) =>
        selectedWeekDates.push({
          date: format(add(startOfToday(), { weeks: 1, days: i }), 'yyyy-MM-dd'),
        }),
      )
    } else {
      times(7)((i: number) =>
        selectedWeekDates.push({
          date: format(add(startOfToday(), { days: i }), 'yyyy-MM-dd'),
        }),
      )
    }

    const filterMorning = (activities: GetEventScheduleItem[]) =>
      activities && activities.filter(activity => getHours(parseInt(activity.startTime, 10)) < 12)

    const filterAfternoon = (activities: GetEventScheduleItem[]) =>
      activities && activities.filter(activity => getHours(parseInt(activity.startTime, 10)) < 17)

    const filterEveningDuties = (activities: GetEventScheduleItem[]) =>
      activities && activities.filter(activity => getHours(parseInt(activity.startTime, 10)) >= 17)

    const byStartTimeThenByEndTime = (a: GetEventScheduleItem, b: GetEventScheduleItem) => {
      isBefore(parseInt(a.startTime, 10), parseInt(b.startTime, 10))
      if (isBefore(parseInt(a.startTime, 10), parseInt(b.startTime, 10))) return -1

      if (isAfter(parseInt(a.startTime, 10), parseInt(b.startTime, 10))) return 1

      if (!a.endTime) return -1
      if (!b.endTime) return 1

      if (isBefore(parseInt(a.endTime, 10), parseInt(b.endTime, 10))) return -1
      if (isAfter(parseInt(a.endTime, 10), parseInt(b.endTime, 10))) return 1

      return 0
    }

    function formatEvent(eventSchedule: GetEventScheduleItem) {
      const { startTime, endTime, eventStatus, eventSubType, eventSubTypeDesc, eventSourceDesc } = eventSchedule
      const comment = eventSubType === 'PA' ? null : eventSourceDesc

      return {
        comment,
        startTime,
        endTime,
        eventStatus,
        type: (eventSubType === 'PA' && eventSourceDesc) || eventSubTypeDesc,
        shortComment: comment && comment.length > 40 ? `${comment.substring(0, 40)}...` : comment,
        cancelled: eventStatus === 'CANC',
      }
    }

    function eventsAction(events: GetEventScheduleItem[]) {
      const morningActivity = filterMorning(events)
      const afternoonActivity = filterAfternoon(events)
      const eveningDuties = filterEveningDuties(events)

      return {
        morningActivities:
          morningActivity && morningActivity.map(activity => formatEvent(activity)).sort(byStartTimeThenByEndTime),
        afternoonActivities:
          afternoonActivity && afternoonActivity.map(activity => formatEvent(activity)).sort(byStartTimeThenByEndTime),
        eveningActivities:
          eveningDuties && eveningDuties.map(activity => formatEvent(activity)).sort(byStartTimeThenByEndTime),
      }
    }

    const days = selectedWeekDates.map(day => ({
      date: formatDate(day.date),
      periods: eventsAction(groupedByDate[day.date]),
    }))

    return res.render('pages/prisonerSchedule', {
      pageTitle: 'Schedule',
      ...mapHeaderNoBannerData(prisonerData),
      days,
      name,
      nextWeekStartDate: oneWeekToday,
    })
  }
}
