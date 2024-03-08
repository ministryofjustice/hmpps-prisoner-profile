import { formatDate } from '../../utils/dateHelpers'
import ReleaseDates from '../../services/interfaces/offencesPageService/ReleaseDates'

interface SummaryRow {
  key: { text: string }
  value: { text: string }
}

const labels: Record<keyof ReleaseDates, string> = {
  actualParoleDate: 'Approved parole date (APD)',
  automaticReleaseDate: 'Automatic release date (ARD)',
  automaticReleaseDateNonDto: 'Automatic release date (ARD)',
  confirmedReleaseDate: 'Confirmed release date',
  conditionalRelease: 'Conditional release date (CRD)',
  conditionalReleaseNonDto: 'Conditional release date (CRD)',
  detentionTrainingOrderPostRecallDate: 'Detention training order post recall release date (DPRRD)',
  earlyRemovalSchemeEligibilityDate: 'Early Removal Scheme eligibility date (ERSED)',
  earlyTermDate: 'Early-term date (ETD)',
  earlyTransferDate: 'Early-transfer date (ETD)',
  homeDetentionCurfewActualDate: 'Home Detention Curfew approved date (HDCAD)',
  homeDetentionCurfewEligibilityDate: 'Home detention curfew eligibility date (HDCED)',
  lateTermDate: 'Late-term date (LTD)',
  lateTransferDate: 'Late-transfer date (LTD)',
  licenceExpiryDate: 'License expiry date (LED)',
  midTermDate: 'Mid-term date (MTD)',
  midTransferDate: 'Mid-transfer date (MTD)',
  nonDtoReleaseDate: 'Release date for non-DTO sentence',
  nonParoleDate: 'Non-parole date (NPD)',
  nonParoleDateNonDto: 'Non-parole date (NPD)',
  paroleEligibilityCalculatedDate: 'Parole eligibility date (PED)',
  postRecallDate: 'Post-recall release date (PRRD)',
  postRecallDateNonDto: 'Post-recall release date (PRRD)',
  releaseOnTemporaryLicenceDate: 'Release on temporary licence (ROTL)',
  sentenceExpiryDate: 'Sentence expiry date (SED)',
  sentenceLicenceExpiryDate: 'Sentence and licence expiry date (SLED)',
  tariffDate: 'Tariff',
  tariffEarlyRemovalSchemeEligibilityDate: 'Tariff Expired Removal Scheme eligibility date (TERSED)',
  topupSupervisionExpiryDate: 'Top-up supervision expiry date (TUSED)',
}
export default (releaseDates: ReleaseDates): SummaryRow[] => {
  return Object.keys(releaseDates)
    .map(dateName => ({
      key: { text: labels[dateName] },
      value: { text: formatDate(releaseDates[dateName], 'long') },
    }))
    .sort((a, b) => {
      if (a.key.text === 'Confirmed release date') return -1
      if (b.key.text === 'Confirmed release date') return 1
      return a.key.text < b.key.text ? -1 : 1
    })
}
