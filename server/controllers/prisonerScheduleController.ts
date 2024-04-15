import { Request, Response } from 'express'
import { add, format, isAfter, isBefore, startOfToday } from 'date-fns'
import { RestClientBuilder } from '../data'
import { PrisonApiClient } from '../data/interfaces/prisonApi/prisonApiClient'
import Prisoner from '../data/interfaces/prisonerSearchApi/Prisoner'
import { mapHeaderNoBannerData } from '../mappers/headerMappers'
import { formatName, groupBy, times } from '../utils/utils'
import { formatDate } from '../utils/dateHelpers'
import { NameFormatStyle } from '../data/enums/nameFormatStyle'
import ScheduledEvent, { SelectedWeekDates } from '../data/interfaces/prisonApi/ScheduledEvent'
import { AuditService, Page } from '../services/auditService'
import logger from '../../logger'

/**
 * Parse requests for case notes routes and orchestrate response
 */

export default class PrisonerScheduleController {
  constructor(
    private readonly prisonApiClientBuilder: RestClientBuilder<PrisonApiClient>,
    private readonly auditService: AuditService,
  ) {}

  public async displayPrisonerSchedule(req: Request, res: Response, prisonerData: Prisoner) {
    const { firstName, middleNames, lastName } = prisonerData
    const name = formatName(firstName, middleNames, lastName, { style: NameFormatStyle.firstLast })

    const { clientToken } = req.middleware
    const prisonApiClient = this.prisonApiClientBuilder(clientToken)

    const selectedWeekDates: SelectedWeekDates[] = [] as SelectedWeekDates[]

    let schedule: ScheduledEvent[] = [] as ScheduledEvent[]
    const { when } = req.query
    const { bookingId } = prisonerData

    if (when === 'nextWeek') {
      schedule = await prisonApiClient.getScheduledEventsForNextWeek(bookingId)
    } else {
      schedule = await prisonApiClient.getScheduledEventsForThisWeek(bookingId)
    }

    const groupedByDate = groupBy(schedule, 'eventDate')
    const oneWeekToday = format(add(startOfToday(), { weeks: 1 }), 'd MMMM yyyy')

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

    const filterMorning = (activities: ScheduledEvent[]) =>
      activities && activities.filter(activity => new Date(activity.startTime).getHours() < 12)

    const filterAfternoon = (activities: ScheduledEvent[]) =>
      activities &&
      activities.filter(
        activity => new Date(activity.startTime).getHours() > 11 && new Date(activity.startTime).getHours() < 17,
      )

    const filterEveningDuties = (activities: ScheduledEvent[]) =>
      activities && activities.filter(activity => new Date(activity.startTime).getHours() >= 17)

    const byStartTimeThenByEndTime = (a: ScheduledEvent, b: ScheduledEvent) => {
      if (isBefore(new Date(a.startTime), new Date(b.startTime))) return -1
      if (isAfter(new Date(a.startTime), new Date(b.startTime))) return 1

      if (!a.endTime) return -1
      if (!b.endTime) return 1

      if (isBefore(new Date(a.endTime), new Date(b.endTime))) return -1
      if (isAfter(new Date(a.endTime), new Date(b.endTime))) return 1

      return 0
    }

    function formatEvent(eventSchedule: ScheduledEvent) {
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

    function eventsAction(events: ScheduledEvent[]) {
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

    const days = selectedWeekDates?.map(day => ({
      date: formatDate(day?.date, 'full'),
      periods: groupedByDate
        ? eventsAction(groupedByDate[day?.date])
        : {
            afternoonActivities: undefined as ScheduledEvent[],
            eveningActivities: undefined as ScheduledEvent[],
            morningActivities: undefined as ScheduledEvent[],
          },
    }))
    this.auditService
      .sendPageView({
        userId: res.locals.user.username,
        userCaseLoads: res.locals.user.caseLoads,
        userRoles: res.locals.user.userRoles,
        prisonerNumber: prisonerData.prisonerNumber,
        prisonId: prisonerData.prisonId,
        correlationId: req.id,
        page: Page.Schedule,
      })
      .catch(error => logger.error(error))

    return res.render('pages/prisonerSchedule', {
      pageTitle: 'Schedule',
      ...mapHeaderNoBannerData(prisonerData),
      days,
      name,
      nextWeekStartDate: oneWeekToday,
      when,
    })
  }
}
