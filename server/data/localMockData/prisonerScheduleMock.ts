import { add, format, startOfToday } from 'date-fns'

const month = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const d = new Date()
const currentMonth = month[d.getMonth()]
const currentYear = d.getFullYear()

export const PrisonerScheduleThisWeekMock = {
  pageTitle: 'Schedule',
  prisonerName: 'Saunders, John',
  prisonerNumber: 'G6123VU',
  prisonId: 'MDI',
  days: [
    {
      date: `${d.getDate()} ${currentMonth} ${currentYear}`,
      periods: undefined as object,
    },
    {
      date: `${parseInt(d.getDate().toString(), 10) + 1} ${currentMonth} ${currentYear}`,
      periods: undefined as object,
    },
    {
      date: `${parseInt(d.getDate().toString(), 10) + 2} ${currentMonth} ${currentYear}`,
      periods: undefined as object,
    },
    {
      date: `${parseInt(d.getDate().toString(), 10) + 3} ${currentMonth} ${currentYear}`,
      periods: undefined as object,
    },
    {
      date: `${parseInt(d.getDate().toString(), 10) + 4} ${currentMonth} ${currentYear}`,
      periods: undefined as object,
    },
    {
      date: `${parseInt(d.getDate().toString(), 10) + 5} ${currentMonth} ${currentYear}`,
      periods: undefined as object,
    },
    {
      date: `${parseInt(d.getDate().toString(), 10) + 6} ${currentMonth} ${currentYear}`,
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
      date: `${parseInt(d.getDate().toString(), 10) + 7} ${currentMonth} ${currentYear}`,
      periods: undefined as object,
    },
    {
      date: `${parseInt(d.getDate().toString(), 10) + 8} ${currentMonth} ${currentYear}`,
      periods: undefined as object,
    },
    {
      date: `${parseInt(d.getDate().toString(), 10) + 9} ${currentMonth} ${currentYear}`,
      periods: undefined as object,
    },
    {
      date: `${parseInt(d.getDate().toString(), 10) + 10} ${currentMonth} ${currentYear}`,
      periods: undefined as object,
    },
    {
      date: `${parseInt(d.getDate().toString(), 10) + 11} ${currentMonth} ${currentYear}`,
      periods: undefined as object,
    },
    {
      date: `${parseInt(d.getDate().toString(), 10) + 12} ${currentMonth} ${currentYear}`,
      periods: undefined as object,
    },
    {
      date: `${parseInt(d.getDate().toString(), 10) + 13} ${currentMonth} ${currentYear}`,
      periods: undefined as object,
    },
  ],
  name: 'John Saunders',
  nextWeekStartDate: '2020-07-31',
}
