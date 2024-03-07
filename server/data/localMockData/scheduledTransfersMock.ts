import { PrisonerPrisonSchedule } from '../interfaces/prisonApi/PrisonerSchedule'

export const scheduledTransfersMock: PrisonerPrisonSchedule[] = [
  {
    offenderNo: 'A1234BC',
    firstName: 'John',
    lastName: 'Saunders',
    event: 'COMP',
    eventDescription: 'Compassionate Transfer',
    eventLocation: 'Moorland (HMP & YOI)',
    eventStatus: 'SCH',
    comment: 'No comment',
    startTime: '2023-11-17T15:09:44',
  },
]
