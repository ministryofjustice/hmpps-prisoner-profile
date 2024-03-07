import ScheduledEvent from '../data/interfaces/prisonApi/ScheduledEvent'
import { formatScheduledEventTime } from './formatScheduledEventTime'

describe('formatScheduledEventTime', () => {
  it.each([
    [undefined, undefined, { startTime: '', endTime: '' }],
    ['10:00:00', undefined, { startTime: '10:00', endTime: '' }],
    [undefined, '10:00:00', { startTime: '', endTime: '10:00' }],
    ['10:00:00', '12:00:00', { startTime: '10:00', endTime: '12:00' }],
    ['08:01:00', '09:02:00', { startTime: '08:01', endTime: '09:02' }],
  ])(
    'Given a start time of "%s" and end time of "%s" returns "%s"',
    (startTime: string, endTime: string, expected: { startTime: string; endTime: string }) => {
      const event = {} as ScheduledEvent
      if (startTime) event.startTime = `2022-01-01T${startTime}`
      if (endTime) event.endTime = `2022-01-01T${endTime}`

      expect(formatScheduledEventTime(event)).toEqual(expected)
    },
  )

  it.each(['cats', '', undefined])('Handles invalid date: %s', (date: string) => {
    const { startTime, endTime } = formatScheduledEventTime({ startTime: date, endTime: date } as ScheduledEvent)
    expect(startTime).toEqual('')
    expect(endTime).toEqual('')
  })
})
