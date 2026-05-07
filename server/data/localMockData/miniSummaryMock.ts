import { MiniCardData } from '../../views/components/miniCard/miniCardData'
import AccountBalances from '../interfaces/prisonApi/AccountBalances'
import VisitSummary from '../interfaces/prisonApi/VisitSummary'
import VisitBalances from '../interfaces/prisonApi/VisitBalances'
import Assessment from '../interfaces/prisonApi/Assessment'
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

export const moneySummaryDataMock: MiniCardData = {
  id: 'money',
  heading: 'Money',
  topLabel: 'Spends',
  topContent: '£240.51',
  topClass: 'big',
  bottomLabel: 'Private cash',
  bottomContentLine1: '£35.00',
  bottomClass: 'big',
  linkLabel: 'Transactions and savings',
}

export const adjudicationsSummaryDataMock: MiniCardData = {
  id: 'adjudications',
  heading: 'Adjudications',
  topLabel: 'Proven in last 3 months',
  topContent: 4,
  topClass: 'big',
  bottomLabel: 'Active',
  bottomContentLine1: 'No active punishments',
  bottomClass: 'small',
  linkLabel: 'Adjudication history',
}

export const visitsSummaryDataMock: MiniCardData = {
  id: 'visits',
  heading: 'Visits',
  topLabel: 'Next visit date',
  topContent: '15/09/2023',
  topClass: 'big',
  bottomLabel: 'Remaining visits',
  bottomContentLine1: 6,
  bottomContentLine3: 'Including 2 privileged visits',
  bottomClass: 'small',
  linkLabel: 'Visits details',
}

export const categorySummaryDataMock: MiniCardData = {
  heading: 'Category',
  items: [{ text: 'B' }, { text: 'Next review: 19/02/2023' }],
  linkLabel: 'Category',
}

export const incentiveSummaryDataMock: MiniCardData = {
  id: 'incentives',
  heading: 'Incentives: since last review',
  items: [
    { text: 'Positive behaviours: 1' },
    { text: 'Negative behaviours: 1' },
    { text: 'Next review by: 01/01/2024' },
  ],
  linkLabel: 'Incentive level details',
}

export const incentiveSummaryNoDataMock: MiniCardData = {
  id: 'incentives',
  heading: 'Incentives: since last review',
  items: [{ text: 'John Saunders has no incentive level history' }],
  linkLabel: 'Incentive level details',
}

export const incentiveSummaryErrorMock: MiniCardData = {
  id: 'incentives',
  heading: 'Incentives: since last review',
  bottomContentError: 'We cannot show these details right now',
  linkLabel: 'Incentive level details',
}

export const csraSummaryDataMock: MiniCardData = {
  heading: 'CSRA',
  items: [{ text: 'Standard' }, { text: 'Last review: 19/02/2021' }],
  linkLabel: 'CSRA history',
}

export const csipSummaryDataMock: MiniCardData = {
  heading: 'CSIP',
  items: [{ text: 'No CSIP history' }],
  linkLabel: 'CSIP history',
}
