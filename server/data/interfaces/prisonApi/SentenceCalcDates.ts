export default interface SentenceCalcDates {
  sentenceExpiryDate?: string
  automaticReleaseDate?: string
  conditionalReleaseDate?: string
  nonParoleDate?: string
  postRecallReleaseDate?: string
  licenceExpiryDate?: string
  homeDetentionCurfewEligibilityDate?: string
  paroleEligibilityDate?: string
  homeDetentionCurfewActualDate?: string
  actualParoleDate?: string
  releaseOnTemporaryLicenceDate?: string
  earlyRemovalSchemeEligibilityDate?: string
  earlyTermDate?: string
  midTermDate?: string
  lateTermDate?: string
  topupSupervisionExpiryDate?: string
  tariffDate?: string
  dtoPostRecallReleaseDate?: string
  tariffEarlyRemovalSchemeEligibilityDate?: string
  effectiveSentenceEndDate?: string
  bookingId: number
  sentenceStartDate?: string
  additionalDaysAwarded?: number
  automaticReleaseOverrideDate?: string
  conditionalReleaseOverrideDate?: string
  nonParoleOverrideDate?: string
  postRecallReleaseOverrideDate?: string
  dtoPostRecallReleaseDateOverride?: string
  nonDtoReleaseDate?: string
  sentenceExpiryCalculatedDate?: string
  sentenceExpiryOverrideDate?: string
  licenceExpiryCalculatedDate?: string
  licenceExpiryOverrideDate?: string
  paroleEligibilityCalculatedDate?: string
  paroleEligibilityOverrideDate?: string
  topupSupervisionExpiryCalculatedDate?: string
  topupSupervisionExpiryOverrideDate?: string
  homeDetentionCurfewEligibilityCalculatedDate?: string
  homeDetentionCurfewEligibilityOverrideDate?: string
  nonDtoReleaseDateType?: 'ARD' | 'CRD' | 'NPD' | 'PRRD'
  confirmedReleaseDate?: string
  releaseDate?: string
  topupSupervisionStartDate?: string
  homeDetentionCurfewEndDate?: string
}
