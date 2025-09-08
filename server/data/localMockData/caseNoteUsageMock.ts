import { CaseNoteUsageSummary } from '../interfaces/caseNotesApi/CaseNoteUsage'
import { CaseNoteSubType, CaseNoteType } from '../enums/caseNoteType'

export const caseNoteUsageMock: CaseNoteUsageSummary = {
  content: {
    G6123VU: [
      {
        personIdentifier: 'G6123VU',
        type: CaseNoteType.PositiveBehaviour,
        subType: CaseNoteSubType.IncentiveEncouragement,
        count: 2,
        latestNote: {
          occurredAt: '2025-01-01T12:00:00.000Z',
        },
      },
      {
        personIdentifier: 'G6123VU',
        type: CaseNoteType.NegativeBehaviour,
        subType: CaseNoteSubType.IncentiveWarning,
        count: 1,
        latestNote: {
          occurredAt: '2025-01-01T12:00:00.000Z',
        },
      },
      {
        personIdentifier: 'G6123VU',
        type: CaseNoteType.PositiveBehaviour,
        subType: 'IGNORE',
        count: 9,
        latestNote: {
          occurredAt: '2025-01-01T12:00:00.000Z',
        },
      },
      {
        personIdentifier: 'G6123VU',
        type: CaseNoteType.NegativeBehaviour,
        subType: 'IGNORE',
        count: 7,
        latestNote: {
          occurredAt: '2025-01-01T12:00:00.000Z',
        },
      },
    ],
  },
}

export const caseNoteUsageMockWithNoResults: CaseNoteUsageSummary = {
  content: {},
}
