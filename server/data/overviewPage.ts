import { ScheduledEvent } from '../interfaces/scheduledEvent'

export const personalDetails = {
  name: 'Dave',
  dateOfBirth: '1979-11-23',
  age: '50',
  nationality: 'British',
  spokenLanguage: 'English',
  croNumber: '183490/90G',
  pncNumber: '90/183490P',
}

export const staffContacts = {
  keyWorker: {
    name: 'David Marks',
    lastSession: '2022-09-14',
  },
  prisonOffenderManager: 'Evan Smith',
  coworkingPrisonOffenderManager: 'Lianne Morgan',
  communityOffenderManager: 'None assigned',
}

export const nonAssociationRows = [
  [{ text: 'Broadstairs, Liam' }, { text: 'A1141GB' }, { text: 'H-1-003' }, { text: 'Rival gang' }],
  [{ text: 'Dennison, Bruce' }, { text: 'A6515HH' }, { text: 'B-2-010' }, { text: 'Perpetrator' }],
  [{ text: 'Gradus, Simon' }, { text: 'A6784OP' }, { text: 'A-3-010' }, { text: 'Rival gang' }],
  [{ text: 'Norton, Stephan' }, { text: 'A9585SD' }, { text: 'C-2-009' }, { text: 'Victim' }],
]

export interface Schedule {
  morning: ScheduledEvent[]
  afternoon: ScheduledEvent[]
  evening: ScheduledEvent[]
}

export const schedule: Schedule = {
  morning: [
    { name: 'Kitchens AM', startTime: '08:45', endTime: '11:45' },
    { name: 'Violence reduction course', startTime: '10:30', endTime: '11:30' },
  ],
  afternoon: [
    { name: 'Kitchens PM', startTime: '13:30', endTime: '16:45' },
    { name: 'Governor call-up', startTime: '15:30', endTime: '16:00' },
  ],
  evening: [{ name: 'Nothing scheduled' }, { name: 'Chess club', startTime: '18:30', endTime: '19:30' }],
}
