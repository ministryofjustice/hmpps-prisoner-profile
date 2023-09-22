import { ScheduledEvent } from '../interfaces/scheduledEvent'

interface filteredEvents {
  morningEvents: ScheduledEvent[]
  afternoonEvents: ScheduledEvent[]
  eveningEvents: ScheduledEvent[]
}

const sortByStartAndEndTime = (a: ScheduledEvent, b: ScheduledEvent) => {
  const [dateAStart, dateBStart] = [new Date(a.startTime), new Date(b.startTime)]
  if (dateAStart < dateBStart) return -1
  if (dateAStart > dateBStart) return 1

  const [dateAEnd, dateBEnd] = [new Date(a.endTime), new Date(b.endTime)]

  if (!a.endTime) return -1
  if (!b.endTime) return 1

  if (dateAEnd < dateBEnd) return -1
  if (dateAEnd > dateBEnd) return 1

  return 0
}

export default (scheduledEvents: ScheduledEvent[]): filteredEvents => {
  if (!Array.isArray(scheduledEvents)) {
    return { morningEvents: [], afternoonEvents: [], eveningEvents: [] }
  }

  const morningEvents = scheduledEvents
    .filter(event => new Date(event.startTime).getHours() < 12)
    .sort(sortByStartAndEndTime)

  const afternoonEvents = scheduledEvents
    .filter(event => {
      const startTimeHour = new Date(event.startTime).getHours()
      return startTimeHour >= 12 && startTimeHour < 17
    })
    .sort(sortByStartAndEndTime)

  const eveningEvents = scheduledEvents
    .filter(event => new Date(event.startTime).getHours() >= 17)
    .sort(sortByStartAndEndTime)

  return {
    morningEvents,
    afternoonEvents,
    eveningEvents,
  }
}
