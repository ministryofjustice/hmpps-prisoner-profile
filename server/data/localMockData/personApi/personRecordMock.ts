import type { DpsPersonRecord, PersonRecord } from '../../interfaces/personApi'

export const mockPersonRecord: PersonRecord = {
  identifiers: {
    prisonNumbers: ['A1234BC', 'B5678DE', 'C9012FG'],
  },
  religion: { code: 'TPRNTS', description: 'They prefer not to say' },
}

export const mockPersonRecordWithReligionHistory: DpsPersonRecord = {
  ...mockPersonRecord,
  religionHistory: [
    {
      current: true,
      religionCode: 'TPRNTS',
      religionDescription: 'They prefer not to say',
      changeReasonKnown: true,
      comments: 'They do not want others to know',
      startDate: '2026-10-28',
      endDate: null,
      createUserId: 'jlpic',
      createDateTime: '2026-10-28T14:30:00',
      modifyUserId: null,
      modifyDateTime: null,
    },
    {
      current: false,
      religionCode: 'CCOG',
      religionDescription: 'Celestial Church of God',
      changeReasonKnown: false,
      comments: null,
      startDate: '2022-01-01',
      endDate: '2026-10-28',
      createUserId: 'jkirk',
      createDateTime: '2022-01-01T09:45:02',
      modifyUserId: 'jlpic',
      modifyDateTime: '2026-10-28T14:30:00',
    },
  ],
}
