import { add, format, startOfToday } from 'date-fns'
import ScheduledEvent from '../interfaces/prisonApi/ScheduledEvent'

export const PrisonerScheduleThisWeekMock = {
  pageTitle: 'Schedule',
  days: [
    {
      date: format(add(startOfToday(), { days: 0 }), 'EEEE d MMMM yyyy'),
      periods: {
        afternoonActivities: undefined as ScheduledEvent[],
        eveningActivities: undefined as ScheduledEvent[],
        morningActivities: undefined as ScheduledEvent[],
      },
    },
    {
      date: format(add(startOfToday(), { days: 1 }), 'EEEE d MMMM yyyy'),
      periods: {
        afternoonActivities: undefined as ScheduledEvent[],
        eveningActivities: undefined as ScheduledEvent[],
        morningActivities: undefined as ScheduledEvent[],
      },
    },
    {
      date: format(add(startOfToday(), { days: 2 }), 'EEEE d MMMM yyyy'),
      periods: {
        afternoonActivities: undefined as ScheduledEvent[],
        eveningActivities: undefined as ScheduledEvent[],
        morningActivities: undefined as ScheduledEvent[],
      },
    },
    {
      date: format(add(startOfToday(), { days: 3 }), 'EEEE d MMMM yyyy'),
      periods: {
        afternoonActivities: undefined as ScheduledEvent[],
        eveningActivities: undefined as ScheduledEvent[],
        morningActivities: undefined as ScheduledEvent[],
      },
    },
    {
      date: format(add(startOfToday(), { days: 4 }), 'EEEE d MMMM yyyy'),
      periods: {
        afternoonActivities: undefined as ScheduledEvent[],
        eveningActivities: undefined as ScheduledEvent[],
        morningActivities: undefined as ScheduledEvent[],
      },
    },
    {
      date: format(add(startOfToday(), { days: 5 }), 'EEEE d MMMM yyyy'),
      periods: {
        afternoonActivities: undefined as ScheduledEvent[],
        eveningActivities: undefined as ScheduledEvent[],
        morningActivities: undefined as ScheduledEvent[],
      },
    },
    {
      date: format(add(startOfToday(), { days: 6 }), 'EEEE d MMMM yyyy'),
      periods: {
        afternoonActivities: undefined as ScheduledEvent[],
        eveningActivities: undefined as ScheduledEvent[],
        morningActivities: undefined as ScheduledEvent[],
      },
    },
  ],
  nextWeekStartDate: format(add(startOfToday(), { days: 7 }), 'd MMMM yyyy'),
}

export const PrisonerScheduleNextWeekMock = {
  pageTitle: 'Schedule',
  days: [
    {
      date: format(add(startOfToday(), { days: 7 }), 'EEEE d MMMM yyyy'),
      periods: {
        afternoonActivities: undefined as ScheduledEvent[],
        eveningActivities: undefined as ScheduledEvent[],
        morningActivities: undefined as ScheduledEvent[],
      },
    },
    {
      date: format(add(startOfToday(), { days: 8 }), 'EEEE d MMMM yyyy'),
      periods: {
        afternoonActivities: undefined as ScheduledEvent[],
        eveningActivities: undefined as ScheduledEvent[],
        morningActivities: undefined as ScheduledEvent[],
      },
    },
    {
      date: format(add(startOfToday(), { days: 9 }), 'EEEE d MMMM yyyy'),
      periods: {
        afternoonActivities: undefined as ScheduledEvent[],
        eveningActivities: undefined as ScheduledEvent[],
        morningActivities: undefined as ScheduledEvent[],
      },
    },
    {
      date: format(add(startOfToday(), { days: 10 }), 'EEEE d MMMM yyyy'),
      periods: {
        afternoonActivities: undefined as ScheduledEvent[],
        eveningActivities: undefined as ScheduledEvent[],
        morningActivities: undefined as ScheduledEvent[],
      },
    },
    {
      date: format(add(startOfToday(), { days: 11 }), 'EEEE d MMMM yyyy'),
      periods: {
        afternoonActivities: undefined as ScheduledEvent[],
        eveningActivities: undefined as ScheduledEvent[],
        morningActivities: undefined as ScheduledEvent[],
      },
    },
    {
      date: format(add(startOfToday(), { days: 12 }), 'EEEE d MMMM yyyy'),
      periods: {
        afternoonActivities: undefined as ScheduledEvent[],
        eveningActivities: undefined as ScheduledEvent[],
        morningActivities: undefined as ScheduledEvent[],
      },
    },
    {
      date: format(add(startOfToday(), { days: 13 }), 'EEEE d MMMM yyyy'),
      periods: {
        afternoonActivities: undefined as ScheduledEvent[],
        eveningActivities: undefined as ScheduledEvent[],
        morningActivities: undefined as ScheduledEvent[],
      },
    },
  ],
  nextWeekStartDate: '2020-07-31',
}
