import { add, format, startOfToday } from 'date-fns'

export const PrisonerScheduleThisWeekMock = {
  pageTitle: 'Schedule',
  prisonerName: 'Saunders, John',
  prisonerNumber: 'G6123VU',
  prisonId: 'MDI',
  days: [
    {
      date: format(add(startOfToday(), { days: 0 }), 'd MMMM yyyy'),
      periods: undefined as object,
    },
    {
      date: format(add(startOfToday(), { days: 1 }), 'd MMMM yyyy'),
      periods: undefined as object,
    },
    {
      date: format(add(startOfToday(), { days: 2 }), 'd MMMM yyyy'),
      periods: undefined as object,
    },
    {
      date: format(add(startOfToday(), { days: 3 }), 'd MMMM yyyy'),
      periods: undefined as object,
    },
    {
      date: format(add(startOfToday(), { days: 4 }), 'd MMMM yyyy'),
      periods: undefined as object,
    },
    {
      date: format(add(startOfToday(), { days: 5 }), 'd MMMM yyyy'),
      periods: undefined as object,
    },
    {
      date: format(add(startOfToday(), { days: 6 }), 'd MMMM yyyy'),
      periods: undefined as object,
    },
  ],
  name: 'John Saunders',
  nextWeekStartDate: format(add(startOfToday(), { days: 7 }), 'yyyy-MM-dd'),
}

export const PrisonerScheduleNextWeekMock = {
  pageTitle: 'Schedule',
  prisonerName: 'Saunders, John',
  prisonerNumber: 'G6123VU',
  prisonId: 'MDI',
  days: [
    {
      date: format(add(startOfToday(), { days: 7 }), 'd MMMM yyyy'),
      periods: undefined as object,
    },
    {
      date: format(add(startOfToday(), { days: 8 }), 'd MMMM yyyy'),
      periods: undefined as object,
    },
    {
      date: format(add(startOfToday(), { days: 9 }), 'd MMMM yyyy'),
      periods: undefined as object,
    },
    {
      date: format(add(startOfToday(), { days: 10 }), 'd MMMM yyyy'),
      periods: undefined as object,
    },
    {
      date: format(add(startOfToday(), { days: 11 }), 'd MMMM yyyy'),
      periods: undefined as object,
    },
    {
      date: format(add(startOfToday(), { days: 12 }), 'd MMMM yyyy'),
      periods: undefined as object,
    },
    {
      date: format(add(startOfToday(), { days: 13 }), 'd MMMM yyyy'),
      periods: undefined as object,
    },
  ],
  name: 'John Saunders',
  nextWeekStartDate: '2020-07-31',
}
