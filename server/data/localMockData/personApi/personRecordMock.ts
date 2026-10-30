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
      current: false,
      religionCode: 'TPRNTS',
      religionDescription: 'They prefer not to say',
      changeReasonKnown: false,
      comments: null,
      startDate: '2026-10-28',
      endDate: null,
      createUserId: 'jlpic',
    },
    {
      current: true,
      religionCode: 'CCOG',
      religionDescription: 'Celestial Church of God',
      changeReasonKnown: false,
      comments: null,
      startDate: '2022-01-01',
      endDate: '2026-10-28',
      createUserId: 'jkirk',
    },
  ],
}
