import LatestCalculation from '../interfaces/calculateReleaseDatesApi/LatestCalculation'

export const latestCalculation: LatestCalculation = {
  prisonerId: 'G6123VU',
  bookingId: 1203326,
  calculatedAt: '2024-03-07T15:16:14',
  calculationRequestId: 49801,
  establishment: 'Kirkham (HMP)',
  reason: 'Correcting an earlier sentence',
  source: 'CRDS',
  dates: [
    {
      type: 'SLED',
      description: 'Sentence and licence expiry date',
      date: '2022-08-21',
      hints: [],
    },
    {
      type: 'TUSED',
      description: 'Top up supervision expiry date',
      date: '2023-04-07',
      hints: [],
    },
    {
      type: 'PRRD',
      description: 'Post recall release date',
      date: '2021-12-06',
      hints: [],
    },
  ],
}

export const latestCalculationWithNomisSource: LatestCalculation = {
  ...latestCalculation,
  source: 'NOMIS',
}
