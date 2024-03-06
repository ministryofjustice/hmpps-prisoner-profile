import { isValid } from 'date-fns'
import { ScheduledEvent } from '../interfaces/scheduledEvent'

const padWithZero = (num: number) => (num.toString().length === 1 ? `0${num}` : `${num}`)
const formatDateToTime = (dateString: string): string => {
  if (dateString) {
    const date = new Date(dateString)
    if (isValid(date)) {
      return `${padWithZero(date.getHours())}:${padWithZero(date.getMinutes())}`
    }
  }
  return ''
}

export const formatScheduledEventTime = (scheduledEvent: ScheduledEvent): { startTime: string; endTime: string } => {
  return { startTime: formatDateToTime(scheduledEvent.startTime), endTime: formatDateToTime(scheduledEvent.endTime) }
}
