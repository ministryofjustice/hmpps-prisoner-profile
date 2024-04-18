import { formatMoney } from '../../utils/utils'
import MiniSummaryData from '../../services/interfaces/overviewPageService/MiniSummary'
import AccountBalances from '../interfaces/prisonApi/AccountBalances'
import VisitSummary from '../interfaces/prisonApi/VisitSummary'
import VisitBalances from '../interfaces/prisonApi/VisitBalances'
import Assessment from '../interfaces/prisonApi/Assessment'
import { formatDate } from '../../utils/dateHelpers'
import AdjudicationSummary from '../interfaces/adjudicationsApi/AdjudicationsSummary'

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
  linkLabel: 'Adjudication history',
} as MiniSummaryData

export const visitsSummaryDataMock: MiniSummaryData = {
  heading: 'Visits',
  topLabel: 'Next visit date',
  topContent: formatDate('2023-09-15', 'short'),
  topClass: 'big',
  bottomLabel: 'Remaining visits',
  bottomContentLine1: 6,
  bottomContentLine3: 'Including 2 privileged visits',
  bottomClass: 'small',
  linkLabel: 'Visits details',
} as MiniSummaryData

export const categorySummaryDataMock: MiniSummaryData = {
  bottomLabel: 'Category',
  bottomContentLine1: 'B',
  bottomContentLine3: `Next review: ${formatDate('2023-02-19', 'short')}`,
  bottomClass: 'small',
  linkLabel: 'Category',
} as MiniSummaryData

export const incentiveSummaryDataMock: MiniSummaryData = {
  bottomLabel: 'Incentives: since last review',
  bottomContentLine1: 'Positive behaviours: 1',
  bottomContentLine2: 'Negative behaviours: 1',
  bottomContentLine3: `Next review by: ${formatDate('2024-01-01', 'short')}`,
  bottomClass: 'small',
  linkLabel: 'Incentive level details',
} as MiniSummaryData

export const incentiveSummaryNoDataMock: MiniSummaryData = {
  bottomLabel: 'Incentives: since last review',
  bottomContentLine1: 'John Saunders has no incentive level history',
  bottomClass: 'small',
  linkLabel: 'Incentive level details',
} as MiniSummaryData

export const incentiveSummaryErrorMock: MiniSummaryData = {
  bottomLabel: 'Incentives: since last review',
  bottomContentLine1: 'We cannot show these details right now',
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
