const ContentTypes = {
  type1: 'TYPE_ONE',
  type2: 'TYPE_TWO',
  type3: 'TYPE_THREE',
}

type MiniSummaryParamType = {
  data: MiniSummaryDataType
  config: {
    header: boolean
    summaryTop: boolean
    summaryBottom: boolean
    summaryTopType: string
    summaryBottomType: string
  }
  contentType: object
  classes: string
}

type MiniSummaryDataType = {
  heading: string
  summaryTopLabel: string
  summaryTopContent: string
  summaryBottomLabel: string
  summaryBottomContentType1: string
  summaryBottomContentType2: string
  summaryBottomContentType3: string
  linkLabel: string
  linkHref: string
}

const moneySummaryData: MiniSummaryDataType = {
  heading: 'Money',
  summaryTopLabel: 'Spends',
  summaryTopContent: '£240.51',
  summaryBottomLabel: 'Private Cash',
  summaryBottomContentType1: '£427.49',
  summaryBottomContentType2: '',
  summaryBottomContentType3: '',
  linkLabel: 'Transactions and savings',
  linkHref: '#',
}

const adjudicationsSummaryData: MiniSummaryDataType = {
  heading: 'Adjudications',
  summaryTopLabel: 'Proven',
  summaryTopContent: '0',
  summaryBottomLabel: 'Private Cash',
  summaryBottomContentType1: '',
  summaryBottomContentType2: 'No active awards',
  summaryBottomContentType3: '',
  linkLabel: 'Adjudications history',
  linkHref: '#',
}

const visitsSummaryData: MiniSummaryDataType = {
  heading: 'Visits',
  summaryTopLabel: 'Next visit date',
  summaryTopContent: '14/09/2023',
  summaryBottomLabel: 'Remaining visits',
  summaryBottomContentType1: '',
  summaryBottomContentType2: '6',
  summaryBottomContentType3: 'Including 2 privileged visits',
  linkLabel: 'Visits details',
  linkHref: '#',
}

const categorySummaryData: MiniSummaryDataType = {
  heading: '',
  summaryTopLabel: '',
  summaryTopContent: '',
  summaryBottomLabel: 'Category',
  summaryBottomContentType1: '',
  summaryBottomContentType2: 'B',
  summaryBottomContentType3: 'Next review: 01/10/2022',
  linkLabel: 'Manage category',
  linkHref: '#',
}

const incentiveSummaryData: MiniSummaryDataType = {
  heading: '',
  summaryTopLabel: '',
  summaryTopContent: '',
  summaryBottomLabel: 'Incentive level',
  summaryBottomContentType1: '',
  summaryBottomContentType2: 'Standard',
  summaryBottomContentType3: 'Next review: 19/03/2023',
  linkLabel: 'Incentive level details',
  linkHref: '#',
}

const csraSummaryData: MiniSummaryDataType = {
  heading: '',
  summaryTopLabel: '',
  summaryTopContent: '',
  summaryBottomLabel: 'CSRA',
  summaryBottomContentType1: '',
  summaryBottomContentType2: 'Standard',
  summaryBottomContentType3: 'Next review: 01/10/2021',
  linkLabel: 'CSRA history',
  linkHref: '#',
}

export const miniSummaryParamGroupA: MiniSummaryParamType[] = [
  {
    data: moneySummaryData,
    config: {
      header: true,
      summaryTop: true,
      summaryBottom: true,
      summaryTopType: ContentTypes.type1,
      summaryBottomType: ContentTypes.type1,
    },
    contentType: ContentTypes,
    classes: 'govuk-grid-row card-body',
  },
  {
    data: adjudicationsSummaryData,
    config: {
      header: true,
      summaryTop: true,
      summaryBottom: true,
      summaryTopType: ContentTypes.type1,
      summaryBottomType: ContentTypes.type2,
    },
    contentType: ContentTypes,
    classes: 'govuk-grid-row card-body',
  },
  {
    data: visitsSummaryData,
    config: {
      header: true,
      summaryTop: true,
      summaryBottom: true,
      summaryTopType: ContentTypes.type1,
      summaryBottomType: ContentTypes.type3,
    },
    contentType: ContentTypes,
    classes: 'govuk-grid-row card-body',
  },
]

export const miniSummaryParamGroupB: MiniSummaryParamType[] = [
  {
    data: categorySummaryData,
    config: {
      header: false,
      summaryTop: true,
      summaryBottom: true,
      summaryTopType: ContentTypes.type1,
      summaryBottomType: ContentTypes.type3,
    },
    contentType: ContentTypes,
    classes: 'govuk-grid-row card-body boxStyle2',
  },
  {
    data: incentiveSummaryData,
    config: {
      header: false,
      summaryTop: true,
      summaryBottom: true,
      summaryTopType: ContentTypes.type1,
      summaryBottomType: ContentTypes.type3,
    },
    contentType: ContentTypes,
    classes: 'govuk-grid-row card-body boxStyle2',
  },
  {
    data: csraSummaryData,
    config: {
      header: false,
      summaryTop: true,
      summaryBottom: true,
      summaryTopType: ContentTypes.type1,
      summaryBottomType: ContentTypes.type3,
    },
    contentType: ContentTypes,
    classes: 'govuk-grid-row card-body boxStyle2',
  },
]
