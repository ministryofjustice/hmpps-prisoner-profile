import { formatDate } from '../../utils/dateHelpers'
import { ReleaseDates } from '../../interfaces/releaseDates'

interface SummaryRow {
  key: { text: string }
  value: { text: string }
}

const labels: Record<keyof ReleaseDates, string> = {
  actualParoleDate: 'Approved parole date (APD)',
  automaticReleaseDate: 'Automatic release date (ARD)',
  conditionalRelease: 'Conditional release date (CRD)',
  detentionTrainingOrderPostRecallDate: 'Detention training order post recall release date (DPRRD)',
  earlyRemovalSchemeEligibilityDate: 'Early Removal Scheme eligibility date (ERSED)',
  earlyTermDate: 'Early-term date (ETD)',
  earlyTransferDate: 'Early-transfer date (ETD)',
  homeDetentionCurfewActualDate: 'Home Detention Curfew approved date (HDCAD)',
  homeDetentionCurfewEligibilityDate: 'Home detention curfew eligibility date (HDCED)',
  lateTermDate: 'Late-term date (LTD)',
  lateTransferDate: 'Late-transfer date (LTD)',
  midTermDate: 'Mid-term date (MTD)',
  midTransferDate: 'Mid-transfer date (MTD)',
  nonDtoReleaseDate: 'Release date for non-DTO sentence',
  nonParoleDate: 'Non-parole date (NPD)',
  paroleEligibilityCalculatedDate: 'Parole eligibility date (PED)',
  postRecallDate: 'Post-recall release date (PRRD)',
  releaseOnTemporaryLicenceDate: 'Release on temporary licence (ROTL)',
  tariffDate: 'Tariff',
  tariffEarlyRemovalSchemeEligibilityDate: 'Tariff Expired Removal Scheme eligibility date (TERSED)',
  topupSupervisionExpiryDate: 'Top-up supervision expiry date (TUSED)',
  sentenceExpiryDate: 'Sentence expiry date (SED)',
  licenceExpiryDate: 'License expiry date (LED)',
  sentenceLicenceExpiryDate: 'Sentence and license expiry date (SLED)',
}
export default (releaseDates: ReleaseDates): SummaryRow[] => {
  return Object.keys(releaseDates)
    .map(dateName => ({
      key: { text: labels[dateName] },
      value: { text: formatDate(releaseDates[dateName], 'long') },
    }))
    .sort((a, b) => (a.key.text < b.key.text ? -1 : 1))
}
