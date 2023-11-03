import { ReleaseDates } from '../../interfaces/releaseDates'
import releaseDatesToSummaryRows from './releaseDatesToSummaryRows'

describe('releaseDatesToSummaryRows.test.ts', () => {
  const releaseDates: ReleaseDates = {
    actualParoleDate: '2016-01-01',
    automaticReleaseDate: '2016-01-02',
    conditionalRelease: '2016-01-04',
    detentionTrainingOrderPostRecallDate: '2016-01-07',
    earlyRemovalSchemeEligibilityDate: '2016-01-10',
    earlyTermDate: '2016-01-09',
    earlyTransferDate: '2016-01-12',
    homeDetentionCurfewActualDate: '2016-01-13',
    homeDetentionCurfewEligibilityDate: '2016-01-14',
    lateTermDate: '2016-01-15',
    lateTransferDate: '2016-01-16',
    midTermDate: '2016-01-20',
    midTransferDate: '2016-01-19',
    nonDtoReleaseDate: '2016-01-21',
    nonParoleDate: '2016-01-22',
    paroleEligibilityCalculatedDate: '2016-01-24',
    postRecallDate: '2016-01-26',
    releaseOnTemporaryLicenceDate: '2016-01-27',
    tariffDate: '2016-01-29',
    tariffEarlyRemovalSchemeEligibilityDate: '2016-01-28',
    topupSupervisionExpiryDate: '2016-01-31',
  }

  it('should return release dates object as summary rows', () => {
    expect(releaseDatesToSummaryRows(releaseDates)).toEqual([
      {
        key: {
          text: 'Approved parole date (APD)',
        },
        value: {
          text: '1 January 2016',
        },
      },
      {
        key: {
          text: 'Automatic release date (ARD)',
        },
        value: {
          text: '2 January 2016',
        },
      },
      {
        key: {
          text: 'Conditional release date (CRD)',
        },
        value: {
          text: '4 January 2016',
        },
      },
      {
        key: {
          text: 'Detention training order post recall release date (DPRRD)',
        },
        value: {
          text: '7 January 2016',
        },
      },
      {
        key: {
          text: 'Early Removal Scheme eligibility date (ERSED)',
        },
        value: {
          text: '10 January 2016',
        },
      },
      {
        key: {
          text: 'Early-term date (ETD)',
        },
        value: {
          text: '9 January 2016',
        },
      },
      {
        key: {
          text: 'Early-transfer date (ETD)',
        },
        value: {
          text: '12 January 2016',
        },
      },
      {
        key: {
          text: 'Home Detention Curfew approved date (HDCAD)',
        },
        value: {
          text: '13 January 2016',
        },
      },
      {
        key: {
          text: 'Home detention curfew eligibility date (HDCED)',
        },
        value: {
          text: '14 January 2016',
        },
      },
      {
        key: {
          text: 'Late-term date (LTD)',
        },
        value: {
          text: '15 January 2016',
        },
      },
      {
        key: {
          text: 'Late-transfer date (LTD)',
        },
        value: {
          text: '16 January 2016',
        },
      },
      {
        key: {
          text: 'Mid-term date (MTD)',
        },
        value: {
          text: '20 January 2016',
        },
      },
      {
        key: {
          text: 'Mid-transfer date (MTD)',
        },
        value: {
          text: '19 January 2016',
        },
      },
      {
        key: {
          text: 'Non-parole date (NPD)',
        },
        value: {
          text: '22 January 2016',
        },
      },
      {
        key: {
          text: 'Parole eligibility date (PED)',
        },
        value: {
          text: '24 January 2016',
        },
      },
      {
        key: {
          text: 'Post-recall release date (PRRD)',
        },
        value: {
          text: '26 January 2016',
        },
      },
      {
        key: {
          text: 'Release date for non-DTO sentence',
        },
        value: {
          text: '21 January 2016',
        },
      },
      {
        key: {
          text: 'Release on temporary licence (ROTL)',
        },
        value: {
          text: '27 January 2016',
        },
      },
      {
        key: {
          text: 'Tariff',
        },
        value: {
          text: '29 January 2016',
        },
      },
      {
        key: {
          text: 'Tariff Expired Removal Scheme eligibility date (TERSED)',
        },
        value: {
          text: '28 January 2016',
        },
      },
      {
        key: {
          text: 'Top-up supervision expiry date (TUSED)',
        },
        value: {
          text: '31 January 2016',
        },
      },
    ])
  })
})
