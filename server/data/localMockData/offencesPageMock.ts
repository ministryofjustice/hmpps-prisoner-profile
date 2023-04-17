import { CourtHearing } from '../../interfaces/prisonApi/courtHearing'
import { SummaryListRow } from '../../utils/utils'
import CourtHearingsMock from './courtHearingsMock'

export const OffencesPageMockSentences = {
  courtCaseData: [
    {
      caseInfoNumber: 'T20167348',
      courtHearings: [] as CourtHearing[],
      courtName: 'Sheffield Crown Court',
      offences: [
        'AATF operator/approved exporter fail to include quarterly information in reg 66(1) report',
        'Drive vehicle for more than 13 hours or more in a working day - domestic',
        'Import nuclear material with intent to evade a prohibition / restriction',
      ],
      sentenceDate: '2 March 2020',
      sentenceTerms: [
        {
          sentenceHeader: 'Sentence 5',
          sentenceTypeDescription: 'EDS LASPO Discretionary Release',
          summaryDetailRows: [
            {
              label: 'Start date',
              value: '2 March 2020',
            },
            {
              label: 'Length',
              value: '10 years',
            },
            {
              label: 'Consecutive to',
              value: undefined,
            },
            undefined,
            {
              label: 'Licence',
              value: '5 years',
            },
          ],
        },
        {
          sentenceHeader: 'Sentence 4',
          sentenceTypeDescription: 'CJA03 Standard Determinate Sentence',
          summaryDetailRows: [
            {
              label: 'Start date',
              value: '2 March 2020',
            },
            {
              label: 'Length',
              value: '100 years',
            },
            {
              label: 'Consecutive to',
              value: undefined,
            },
            {
              label: 'Fine',
              value: '£10,000.00',
            },
            undefined,
          ],
        },
      ],
    },
  ],
  courtCasesSentenceDetailsId: 'court-cases-sentence-details',
  releaseDates: {
    dates: [
      {
        key: {
          text: 'Conditional release',
        },
        value: {
          text: '29 January 2076',
        },
      },
      {
        key: {
          text: 'Post recall release',
        },
        value: {
          text: '12 December 2021',
        },
      },
      {
        key: {
          text: 'Parole eligibility',
        },
        value: {
          text: '12 December 2021',
        },
      },
      {
        key: {
          text: 'Licence expiry',
        },
        value: {
          text: '12 March 2132',
        },
      },
      {
        key: {
          text: 'Sentence expiry',
        },
        value: {
          text: '12 March 2132',
        },
      },
    ],
  },
}

export const OffencesPageMockHearings = {
  courtCaseData: [
    {
      caseInfoNumber: 'T20167348',
      courtHearings: CourtHearingsMock,
      courtName: 'Sheffield Crown Court',
      offences: [
        'AATF operator/approved exporter fail to include quarterly information in reg 66(1) report',
        'Drive vehicle for more than 13 hours or more in a working day - domestic',
        'Import nuclear material with intent to evade a prohibition / restriction',
      ],
      sentenceDate: '2 March 2020',
      sentenceTerms: [] as CourtHearing[],
    },
  ],
  courtCasesSentenceDetailsId: 'court-cases-sentence-details',
  releaseDates: {
    dates: [
      {
        key: {
          text: 'Conditional release',
        },
        value: {
          text: '29 January 2076',
        },
      },
      {
        key: {
          text: 'Post recall release',
        },
        value: {
          text: '12 December 2021',
        },
      },
      {
        key: {
          text: 'Parole eligibility',
        },
        value: {
          text: '12 December 2021',
        },
      },
      {
        key: {
          text: 'Licence expiry',
        },
        value: {
          text: '12 March 2132',
        },
      },
      {
        key: {
          text: 'Sentence expiry',
        },
        value: {
          text: '12 March 2132',
        },
      },
    ],
  },
}

export const MergeMostRecentLicenseTermMock = {
  bookingId: 1102484,
  caseId: '1563148',
  fineAmount: 10000,
  licence: {
    days: undefined as number,
    months: undefined as number,
    weeks: undefined as number,
    years: 5,
  },
  lifeSentence: false,
  lineSeq: 4,
  sentenceSequence: 4,
  sentenceStartDate: '2020-03-02',
  sentenceTermCode: 'IMP',
  sentenceType: 'ADIMP',
  sentenceTypeDescription: 'CJA03 Standard Determinate Sentence',
  startDate: '2020-03-02',
  termSequence: 1,
  years: 100,
}

export const GroupedSentencesMock = [
  {
    caseId: '1563148',
    items: [
      {
        bookingId: 1102484,
        caseId: '1563148',
        lifeSentence: false,
        lineSeq: 5,
        sentenceSequence: 5,
        sentenceStartDate: '2020-03-02',
        sentenceTermCode: 'IMP',
        sentenceType: 'LASPO_DR',
        sentenceTypeDescription: 'EDS LASPO Discretionary Release',
        startDate: '2020-03-02',
        termSequence: 1,
        years: 10,
      },
      {
        bookingId: 1102484,
        caseId: '1563148',
        lifeSentence: false,
        lineSeq: 5,
        sentenceSequence: 5,
        sentenceStartDate: '2020-03-02',
        sentenceTermCode: 'LIC',
        sentenceType: 'LASPO_DR',
        sentenceTypeDescription: 'EDS LASPO Discretionary Release',
        startDate: '2030-03-02',
        termSequence: 2,
        years: 5,
      },
      {
        bookingId: 1102484,
        caseId: '1563148',
        lifeSentence: false,
        lineSeq: 5,
        sentenceSequence: 5,
        sentenceStartDate: '2020-03-02',
        sentenceTermCode: 'LIC',
        sentenceType: 'LASPO_DR',
        sentenceTypeDescription: 'EDS LASPO Discretionary Release',
        startDate: '2020-03-02',
        termSequence: 3,
        years: 6,
      },
      {
        bookingId: 1102484,
        caseId: '1563148',
        lifeSentence: false,
        lineSeq: 5,
        sentenceSequence: 5,
        sentenceStartDate: '2020-03-02',
        sentenceTermCode: 'LIC',
        sentenceType: 'LASPO_DR',
        sentenceTypeDescription: 'EDS LASPO Discretionary Release',
        startDate: '2020-03-02',
        termSequence: 4,
        years: 2,
      },
    ],
    key: 5,
    summaryListRows: [] as SummaryListRow[],
  },
  {
    caseId: '1563148',
    items: [
      {
        bookingId: 1102484,
        caseId: '1563148',
        fineAmount: 10000,
        lifeSentence: false,
        lineSeq: 4,
        sentenceSequence: 4,
        sentenceStartDate: '2020-03-02',
        sentenceTermCode: 'IMP',
        sentenceType: 'ADIMP',
        sentenceTypeDescription: 'CJA03 Standard Determinate Sentence',
        startDate: '2020-03-02',
        termSequence: 1,
        years: 100,
      },
    ],
    key: 4,
    summaryListRows: [] as SummaryListRow[],
  },
]

export const GetCourtCaseData = [
  {
    caseInfoNumber: 'T20167348',
    courtHearings: [] as CourtHearing[],
    courtName: 'Sheffield Crown Court',
    offences: [
      'AATF operator/approved exporter fail to include quarterly information in reg 66(1) report',
      'Drive vehicle for more than 13 hours or more in a working day - domestic',
      'Import nuclear material with intent to evade a prohibition / restriction',
    ],
    sentenceDate: '2 March 2020',
    sentenceTerms: [
      {
        sentenceHeader: 'Sentence 5',
        sentenceTypeDescription: 'EDS LASPO Discretionary Release',
        summaryDetailRows: [
          {
            label: 'Start date',
            value: '2 March 2020',
          },
          {
            label: 'Length',
            value: '10 years',
          },
          {
            label: 'Consecutive to',
            value: undefined,
          },
          undefined,
          {
            label: 'Licence',
            value: '5 years',
          },
        ],
      },
      {
        sentenceHeader: 'Sentence 4',
        sentenceTypeDescription: 'CJA03 Standard Determinate Sentence',
        summaryDetailRows: [
          {
            label: 'Start date',
            value: '2 March 2020',
          },
          {
            label: 'Length',
            value: '100 years',
          },
          {
            label: 'Consecutive to',
            value: undefined,
          },
          {
            label: 'Fine',
            value: '£10,000.00',
          },
          undefined,
        ],
      },
    ],
  },
]

export const GetReleaseDates = {
  dates: [
    {
      key: {
        text: 'Conditional release',
      },
      value: {
        text: '29 January 2076',
      },
    },
    {
      key: {
        text: 'Post recall release',
      },
      value: {
        text: '12 December 2021',
      },
    },
    {
      key: {
        text: 'Parole eligibility',
      },
      value: {
        text: '12 December 2021',
      },
    },
    {
      key: {
        text: 'Licence expiry',
      },
      value: {
        text: '12 March 2132',
      },
    },
    {
      key: {
        text: 'Sentence expiry',
      },
      value: {
        text: '12 March 2132',
      },
    },
  ],
}
