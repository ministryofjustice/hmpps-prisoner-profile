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
  cash: 0,
  savings: 0,
  damageObligations: 0,
  currency: 'GBP',
}

export const adjudicationSummaryMock: AdjudicationSummary = {
  adjudicationCount: 4,
  bookingId: 123456,
  awards: [],
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
    classificationCode: 'B',
    classification: 'Cat B',
    nextReviewDate: '2023-02-19',
  } as Assessment,
  {
    assessmentDate: '2021-02-19',
    assessmentCode: 'CSR',
    classificationCode: 'STANDARD',
    classification: 'Standard',
    nextReviewDate: '2023-02-19',
  } as Assessment,
]

const moneySummaryDataMock: MiniSummaryData = {
  heading: 'Money',
  topLabel: 'Spends',
  topContent: formatMoney(240.51),
  topClass: 'big',
  bottomLabel: 'Private Cash',
  bottomContentLine1: formatMoney(0),
  bottomClass: 'big',
  linkLabel: 'Transactions and savings',
  linkHref: '#',
}

const adjudicationsSummaryDataMock: MiniSummaryData = {
  heading: 'Adjudications',
  topLabel: 'Proven in last 3 months',
  topContent: 4,
  topClass: 'big',
  bottomLabel: 'Active',
  bottomContentLine1: 'No active punishments',
  bottomClass: 'small',
  linkLabel: 'Adjudications history',
  linkHref: '#',
}

const visitsSummaryDataMock: MiniSummaryData = {
  heading: 'Visits',
  topLabel: 'Next visit date',
  topContent: formatDate('2023-09-15', 'short'),
  topClass: 'big',
  bottomLabel: 'Remaining visits',
  bottomContentLine1: 6,
  bottomContentLine2: formatPrivilegedVisitsSummary(2),
  bottomClass: 'small',
  linkLabel: 'Visits details',
  linkHref: '#',
}

const categorySummaryDataMock: MiniSummaryData = {
  bottomLabel: 'Category',
  bottomContentLine1: 'B',
  bottomContentLine2: `Next review: ${formatDate('2023-02-19', 'short')}`,
  bottomClass: 'small',
  linkLabel: 'Manage category',
  linkHref: '#',
}

const incentiveSummaryDataMock: MiniSummaryData = {
  bottomLabel: 'Incentive level',
  bottomContentLine1: 'Standard',
  bottomContentLine2: `Next review: ${formatDate('2024-01-30', 'short')}`,
  bottomClass: 'small',
  linkLabel: 'Incentive level details',
  linkHref: '#',
}

const csraSummaryDataMock: MiniSummaryData = {
  bottomLabel: 'CSRA',
  bottomContentLine1: 'Standard',
  bottomContentLine2: `Last review: ${formatDate('2021-02-19', 'short')}`,
  bottomClass: 'small',
  linkLabel: 'CSRA history',
  linkHref: '#',
}

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
