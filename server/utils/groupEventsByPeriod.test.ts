import { ScheduledEvent } from '../interfaces/scheduledEvent'
import groupEventsByPeriod from './groupEventsByPeriod'

const eventsForHours = (hours: string[]): ScheduledEvent[] =>
  hours.map(hour => ({
    bookingId: 1234,
    eventClass: '',
    eventDate: '2022-12-12',
    eventSource: '',
    eventStatus: '',
    eventSubType: '',
    eventSubTypeDesc: '',
    eventType: '',
    eventTypeDesc: '',
    startTime: `2022-12-12T${hour}:00:00`,
  }))

describe('groupEventsByPeriod', () => {
  describe('grouping events', () => {
    describe('Given no events', () => {
      it('Returns empty grouped events', () => {
        const events: ScheduledEvent[] = []
        const groupedEvents = groupEventsByPeriod(events)
        expect(groupedEvents.morningEvents).toEqual([])
        expect(groupedEvents.afternoonEvents).toEqual([])
        expect(groupedEvents.eveningEvents).toEqual([])
      })
    })

    describe('Given only morning events', () => {
      it('returns grouped morning events', () => {
        const events = eventsForHours(['08', '11'])
        const groupedEvents = groupEventsByPeriod(events)
        expect(groupedEvents.morningEvents).toEqual(events)
        expect(groupedEvents.afternoonEvents).toEqual([])
        expect(groupedEvents.eveningEvents).toEqual([])
      })
    })

    describe('Given only afternoon events', () => {
      it('returns grouped afternoon events', () => {
        const events = eventsForHours(['12', '16'])
        const groupedEvents = groupEventsByPeriod(events)
        expect(groupedEvents.morningEvents).toEqual([])
        expect(groupedEvents.afternoonEvents).toEqual(events)
        expect(groupedEvents.eveningEvents).toEqual([])
      })
    })

    describe('Given only evening events', () => {
      it('returns grouped evening events', () => {
        const events = eventsForHours(['17', '23'])
        const groupedEvents = groupEventsByPeriod(events)
        expect(groupedEvents.morningEvents).toEqual([])
        expect(groupedEvents.afternoonEvents).toEqual([])
        expect(groupedEvents.eveningEvents).toEqual(events)
      })
    })

    describe('Given events across all three periods', () => {
      it('Returns correctly grouped events', () => {
        const morningEvents = eventsForHours(['08', '11'])
        const afternoonEvents = eventsForHours(['12', '16'])
        const eveningEvents = eventsForHours(['17', '23'])
        const events = [...morningEvents, ...afternoonEvents, ...eveningEvents]
        const groupedEvents = groupEventsByPeriod(events)
        expect(groupedEvents.morningEvents).toEqual(morningEvents)
        expect(groupedEvents.afternoonEvents).toEqual(afternoonEvents)
        expect(groupedEvents.eveningEvents).toEqual(eveningEvents)
      })
    })
  })

  describe('ordering events', () => {
    it('orders events in the same category by start time', () => {
      const events = eventsForHours(['23', '17', '16', '12', '11', '09'])
      const { morningEvents, afternoonEvents, eveningEvents } = groupEventsByPeriod(events)
      expect(morningEvents[0].startTime).toEqual('2022-12-12T09:00:00')
      expect(morningEvents[1].startTime).toEqual('2022-12-12T11:00:00')
      expect(afternoonEvents[0].startTime).toEqual('2022-12-12T12:00:00')
      expect(afternoonEvents[1].startTime).toEqual('2022-12-12T16:00:00')
      expect(eveningEvents[0].startTime).toEqual('2022-12-12T17:00:00')
      expect(eveningEvents[1].startTime).toEqual('2022-12-12T23:00:00')
    })

    it('orders events with the same start time by their end time', () => {
      const events = eventsForHours(['10', '10'])
      events[0].endTime = '2022-12-12T11:30:00'
      events[1].endTime = '2022-12-12T11:00:00'
      const { morningEvents } = groupEventsByPeriod(events)
      expect(morningEvents[0].endTime).toEqual('2022-12-12T11:00:00')
      expect(morningEvents[1].endTime).toEqual('2022-12-12T11:30:00')
    })
  })
})
