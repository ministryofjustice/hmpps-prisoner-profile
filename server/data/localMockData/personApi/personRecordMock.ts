import type { DpsPersonRecord, PersonRecord } from '../../interfaces/personApi'

export const mockPersonRecord: PersonRecord = {
  identifiers: {
    prisonNumbers: ['A1234BC', 'B5678DE', 'C9012FG'],
  },
  religion: { code: 'CCOG', description: 'Celestial Church of God' },
}

export const mockPersonRecordWithReligionHistory: DpsPersonRecord = {
  ...mockPersonRecord,
  religionHistory: [
    {
      current: true,
      religionCode: 'CCOG',
      religionDescription: 'Celestial Church of God',
      changeReasonKnown: false,
      comments: null,
      startDate: '2022-01-01',
      endDate: null,
      createUserId: 'jkirk',
    },
  ],
}
