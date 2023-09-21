import { formatMoney, formatPrivilegedVisitsSummary } from '../../utils/utils'
import { MiniSummary, MiniSummaryData } from '../../interfaces/miniSummary'
import { AccountBalances } from '../../interfaces/accountBalances'
import { AdjudicationSummary } from '../../interfaces/adjudicationSummary'
import { VisitSummary } from '../../interfaces/visitSummary'
import { VisitBalances } from '../../interfaces/visitBalances'
import { Assessment } from '../../interfaces/prisonApi/assessment'
import { formatDate } from '../../utils/dateHelpers'

export const accountBalancesMock: AccountBalances = {
  spends: 240.51,
  cash: 35,
  savings: 80,
  damageObligations: 100,
  currency: 'GBP',
}

export const adjudicationSummaryMock: AdjudicationSummary = {
  adjudicationCount: 4,
  bookingId: 123456,
  awards: [],
}

export const adjudicationSummaryWithActiveMock: AdjudicationSummary = {
  adjudicationCount: 4,
  bookingId: 123456,
  awards: [
    {
      bookingId: 1102484,
      sanctionCode: 'FORFEIT',
      sanctionCodeDescription: 'Forfeiture of Privileges',
      days: 10,
      comment: 'Loss of CANTEEN',
      effectiveDate: '2023-05-31',
      status: 'SUSPENDED',
      statusDescription: 'Suspended',
      hearingId: 2012387,
      hearingSequence: 1,
    },
  ],
}

export const visitSummaryMock: VisitSummary = {
  hasVisits: true,
  startDateTime: '2023-09-15',
}

export const visitBalancesMock: VisitBalances = {
  remainingVo: 6,
  remainingPvo: 2,
} as VisitBalances

export const assessmentsMock: Assessment[] = [
  {
    assessmentDate: '2023-02-19',
    assessmentCode: 'CATEGORY',
    assessmentDescription: 'Category',
    classificationCode: 'B',
    classification: 'Cat B',
    nextReviewDate: '2023-02-19',
  } as Assessment,
  {
    assessmentDate: '2021-02-19',
    assessmentCode: 'CSR',
    assessmentDescription: 'CSR Rating',
    classificationCode: 'STANDARD',
    classification: 'Standard',
    nextReviewDate: '2023-02-19',
  } as Assessment,
]

export const moneySummaryDataMock: MiniSummaryData = {
  heading: 'Money',
  topLabel: 'Spends',
  topContent: formatMoney(240.51),
  topClass: 'big',
  bottomLabel: 'Private cash',
  bottomContentLine1: formatMoney(35.0),
  bottomClass: 'big',
  linkLabel: 'Transactions and savings',
} as MiniSummaryData

export const adjudicationsSummaryDataMock: MiniSummaryData = {
  heading: 'Adjudications',
  topLabel: 'Proven in last 3 months',
  topContent: 4,
  topClass: 'big',
  bottomLabel: 'Active',
  bottomContentLine1: 'No active punishments',
  bottomClass: 'small',
  linkLabel: 'Adjudications history',
} as MiniSummaryData

export const visitsSummaryDataMock: MiniSummaryData = {
  heading: 'Visits',
  topLabel: 'Next visit date',
  topContent: formatDate('2023-09-15', 'short'),
  topClass: 'big',
  bottomLabel: 'Remaining visits',
  bottomContentLine1: 6,
  bottomContentLine3: formatPrivilegedVisitsSummary(2),
  bottomClass: 'small',
  linkLabel: 'Visits details',
} as MiniSummaryData

export const categorySummaryDataMock: MiniSummaryData = {
  bottomLabel: 'Category',
  bottomContentLine1: 'B',
  bottomContentLine3: `Next review: ${formatDate('2023-02-19', 'short')}`,
  bottomClass: 'small',
  linkLabel: 'View category',
} as MiniSummaryData

export const incentiveSummaryDataMock: MiniSummaryData = {
  bottomLabel: 'Incentives: since last review',
  bottomContentLine1: 'Positive behaviours: 1',
  bottomContentLine2: 'Negative behaviours: 1',
  bottomContentLine3: `Next review by: ${formatDate('2024-01-01', 'short')}`,
  bottomClass: 'small',
  linkLabel: 'Incentive level details',
} as MiniSummaryData

export const csraSummaryDataMock: MiniSummaryData = {
  bottomLabel: 'CSRA',
  bottomContentLine1: 'Standard',
  bottomContentLine3: `Last review: ${formatDate('2021-02-19', 'short')}`,
  bottomClass: 'small',
  linkLabel: 'CSRA history',
} as MiniSummaryData

export const miniSummaryGroupAMock: MiniSummary[] = [
  {
    data: moneySummaryDataMock,
    classes: 'govuk-grid-row card-body',
  },
  {
    data: adjudicationsSummaryDataMock,
    classes: 'govuk-grid-row card-body',
  },
  {
    data: visitsSummaryDataMock,
    classes: 'govuk-grid-row card-body',
  },
]

export const miniSummaryGroupBMock: MiniSummary[] = [
  {
    data: categorySummaryDataMock,
    classes: 'govuk-grid-row card-body',
  },
  {
    data: incentiveSummaryDataMock,
    classes: 'govuk-grid-row card-body',
  },
  {
    data: csraSummaryDataMock,
    classes: 'govuk-grid-row card-body',
  },
]
