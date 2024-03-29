import OffenceHistoryDetail from '../interfaces/prisonApi/OffenceHistoryDetail'
import { ChargeResultCode } from '../enums/chargeCodes'

export const OffenceHistoryMock: OffenceHistoryDetail[] = [
  {
    bookingId: 580596,
    offenceDate: '2011-02-16',
    offenceDescription: 'Burglary dwelling and theft  - no violence',
    offenceCode: 'TH68036',
    statuteCode: 'TH68',
    mostSerious: false,
    primaryResultCode: ChargeResultCode.recall_to_prison,
    primaryResultDescription: 'Recall to Prison',
    primaryResultConviction: true,
    secondaryResultConviction: false,
    courtDate: '2012-02-15',
    caseId: 669502,
  },
  {
    bookingId: 401267,
    offenceDate: '2011-02-26',
    offenceDescription: 'Breaching probation order',
    offenceCode: 'PC73001',
    statuteCode: 'PC73',
    mostSerious: false,
    primaryResultCode: ChargeResultCode.imprisonment,
    primaryResultDescription: 'Imprisonment',
    primaryResultConviction: true,
    secondaryResultConviction: false,
    courtDate: '2011-05-18',
    caseId: 462833,
  },
  {
    bookingId: 580596,
    offenceDate: '2011-03-20',
    offenceDescription: 'Breach of a community punishment order',
    offenceCode: 'PC00006',
    statuteCode: 'PC00',
    mostSerious: false,
    primaryResultCode: ChargeResultCode.recall_to_prison,
    primaryResultDescription: 'Recall to Prison',
    primaryResultConviction: true,
    secondaryResultConviction: false,
    courtDate: '2012-02-15',
    caseId: 669502,
  },
  {
    bookingId: 401267,
    offenceDate: '2011-03-25',
    offenceDescription: 'Burglary dwelling and theft  - no violence',
    offenceCode: 'TH68036',
    statuteCode: 'TH68',
    mostSerious: true,
    primaryResultCode: ChargeResultCode.imprisonment,
    primaryResultDescription: 'Imprisonment',
    primaryResultConviction: true,
    secondaryResultConviction: false,
    courtDate: '2011-05-18',
    caseId: 462833,
  },
  {
    bookingId: 580596,
    offenceDate: '2012-02-26',
    offenceDescription: 'Burglary dwelling and theft  - no violence',
    offenceCode: 'TH68036',
    statuteCode: 'TH68',
    mostSerious: false,
    primaryResultCode: ChargeResultCode.recall_to_prison,
    primaryResultDescription: 'Recall to Prison',
    primaryResultConviction: true,
    secondaryResultConviction: false,
    courtDate: '2013-07-10',
    caseId: 666929,
  },
  {
    bookingId: 580596,
    offenceDate: '2012-03-05',
    offenceDescription: 'Breach of an anti-social behaviour order',
    offenceCode: 'CD98002',
    statuteCode: 'CD98',
    mostSerious: false,
    primaryResultCode: '1057',
    primaryResultDescription: 'No Separate Penalty',
    primaryResultConviction: true,
    secondaryResultConviction: false,
    courtDate: '2012-05-04',
    caseId: 666929,
  },
  {
    bookingId: 580596,
    offenceDate: '2012-03-11',
    offenceDescription: 'Breaching probation order',
    offenceCode: 'PC73001',
    statuteCode: 'PC73',
    mostSerious: false,
    primaryResultCode: ChargeResultCode.recall_to_prison,
    primaryResultDescription: 'Recall to Prison',
    primaryResultConviction: true,
    secondaryResultConviction: false,
    courtDate: '2013-07-10',
    caseId: 666929,
  },
  {
    bookingId: 580596,
    offenceDate: '2013-08-14',
    offenceDescription: 'Theft in dwelling other than an automatic machine or meter',
    offenceCode: 'TH68002',
    statuteCode: 'TH68',
    mostSerious: false,
    primaryResultCode: ChargeResultCode.recall_to_prison,
    primaryResultDescription: 'Recall to Prison',
    primaryResultConviction: true,
    secondaryResultConviction: false,
    courtDate: '2015-02-11',
    caseId: 955236,
  },
  {
    bookingId: 580596,
    offenceDate: '2013-08-18',
    offenceRangeDate: '2013-07-10',
    offenceDescription: 'Burglary dwelling and theft  - no violence',
    offenceCode: 'TH68036',
    statuteCode: 'TH68',
    mostSerious: false,
    primaryResultCode: ChargeResultCode.recall_to_prison,
    primaryResultDescription: 'Recall to Prison',
    primaryResultConviction: true,
    secondaryResultConviction: false,
    courtDate: '2015-02-11',
    caseId: 955236,
  },
  {
    bookingId: 1102484,
    offenceDate: '2016-07-14',
    offenceDescription: 'Burglary dwelling - with intent to steal',
    offenceCode: 'TH68026',
    statuteCode: 'TH68',
    mostSerious: false,
    primaryResultCode: ChargeResultCode.imprisonment,
    primaryResultDescription: 'Imprisonment',
    primaryResultConviction: true,
    secondaryResultConviction: false,
    courtDate: '2020-06-18',
    caseId: 1434365,
  },
  {
    bookingId: 1102484,
    offenceDate: '2016-07-17',
    offenceRangeDate: '2016-05-29',
    offenceDescription: 'Burglary other than dwelling - theft',
    offenceCode: 'TH68037',
    statuteCode: 'TH68',
    mostSerious: false,
    primaryResultCode: ChargeResultCode.imprisonment,
    primaryResultDescription: 'Imprisonment',
    primaryResultConviction: true,
    secondaryResultConviction: false,
    courtDate: '2017-01-10',
    caseId: 1507172,
  },
  {
    bookingId: 1102484,
    offenceDescription: 'Behave in an indecent / disorderly manner within Manchester International Airport',
    offenceCode: 'MA55026',
    statuteCode: 'MA55',
    mostSerious: false,
    primaryResultCode: ChargeResultCode.imprisonment,
    primaryResultDescription: 'Imprisonment',
    primaryResultConviction: true,
    secondaryResultConviction: false,
    courtDate: '2020-07-01',
    caseId: 1563198,
  },
  {
    bookingId: 580596,
    offenceDescription: 'Breach of personal licence condition - Gambling Act 2005',
    offenceCode: 'GA05046',
    statuteCode: 'GA05',
    mostSerious: false,
    primaryResultCode: ChargeResultCode.recall_to_prison,
    primaryResultDescription: 'Recall to Prison',
    primaryResultConviction: true,
    secondaryResultConviction: false,
    courtDate: '2012-02-15',
    caseId: 669502,
  },
  {
    bookingId: 1102484,
    offenceDescription: 'Drive vehicle for more than 13 hours or more in a working day - domestic',
    offenceCode: 'TR68132',
    statuteCode: 'TR68',
    mostSerious: true,
    primaryResultCode: ChargeResultCode.imprisonment,
    primaryResultDescription: 'Imprisonment',
    primaryResultConviction: true,
    secondaryResultConviction: false,
    courtDate: '2020-03-02',
    caseId: 1563148,
  },
  {
    bookingId: 1102484,
    offenceDescription: 'AATF operator/approved exporter fail to include quarterly information in reg 66(1) report',
    offenceCode: 'WE13097',
    statuteCode: 'WE13',
    mostSerious: false,
    primaryResultCode: ChargeResultCode.imprisonment,
    primaryResultDescription: 'Imprisonment',
    primaryResultConviction: true,
    secondaryResultConviction: false,
    courtDate: '2020-03-02',
    caseId: 1563148,
  },
  {
    bookingId: 1102484,
    offenceDescription: 'Import nuclear material with intent to evade a prohibition / restriction',
    offenceCode: 'CE79245',
    statuteCode: 'CE79',
    mostSerious: false,
    primaryResultCode: ChargeResultCode.imprisonment,
    primaryResultDescription: 'Imprisonment',
    primaryResultConviction: true,
    secondaryResultConviction: false,
    courtDate: '2020-03-02',
    caseId: 1563148,
  },
  {
    bookingId: 1102484,
    offenceDescription: 'Accept private hire booking while not holder of PHV operators licence - London',
    offenceCode: 'PH98001',
    statuteCode: 'PH98',
    mostSerious: false,
    primaryResultCode: ChargeResultCode.imprisonment,
    primaryResultDescription: 'Imprisonment',
    primaryResultConviction: true,
    secondaryResultConviction: false,
    courtDate: '2020-07-13',
    caseId: 1563201,
  },
]

export const OffenceHistoryMockA: OffenceHistoryDetail[] = [
  {
    bookingId: 1167133,
    offenceDate: '2016-07-23',
    offenceDescription: '(CP TEST) Drive a motor vehicle dangerously',
    offenceCode: 'RT88026',
    statuteCode: 'RT88',
    mostSerious: false,
    primaryResultCode: ChargeResultCode.imprisonment,
    primaryResultDescription: 'Imprisonment',
    primaryResultConviction: true,
    secondaryResultConviction: false,
    courtDate: '2018-09-21',
    caseId: 1520515,
  },
  {
    bookingId: 1167133,
    offenceDate: '2016-08-04',
    offenceDescription: 'Cause serious injury by dangerous driving',
    offenceCode: 'RT88526',
    statuteCode: 'RT88',
    mostSerious: true,
    primaryResultCode: ChargeResultCode.imprisonment,
    primaryResultDescription: 'Imprisonment',
    primaryResultConviction: true,
    secondaryResultConviction: false,
    courtDate: '2018-09-21',
    caseId: 1520515,
  },
  {
    bookingId: 1167133,
    offenceDescription: 'Drive motor vehicle when alcohol level above limit',
    offenceCode: 'RT88007',
    statuteCode: 'RT88',
    mostSerious: false,
    primaryResultCode: ChargeResultCode.imprisonment,
    primaryResultDescription: 'Imprisonment',
    primaryResultConviction: true,
    secondaryResultConviction: false,
    courtDate: '2018-09-21',
    caseId: 1520515,
  },
]
