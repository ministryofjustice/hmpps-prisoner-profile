export type Prisoner = {
  prisonerNumber: string
  pncNumber: string
  pncNumberCanonicalShort: string
  pncNumberCanonicalLong: string
  croNumber: string
  bookingId: number
  bookNumber: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: string
  ethnicity: string
  youthOffender?: boolean
  maritalStatus?: string
  religion?: string
  nationality: string
  status?: string
  lastMovementTypeCode?: string
  lastMovementReasonCode?: string
  inOutStatus?: string
  prisonId: string
  prisonName: string
  cellLocation?: string
  aliases: Aliase[]
  alerts: Alert[]
  csra?: string
  category: string
  legalStatus: string
  imprisonmentStatus: string
  imprisonmentStatusDescription: string
  mostSeriousOffence: string
  recall: boolean
  indeterminateSentence: boolean
  sentenceStartDate: string
  confirmedReleaseDate?: string
  releaseDate: string
  sentenceExpiryDate: string
  licenceExpiryDate: string
  nonDtoReleaseDate: string
  nonDtoReleaseDateType: string
  receptionDate: string
  paroleEligibilityDate?: string
  postRecallReleaseDate?: string
  conditionalReleaseDate: string
  locationDescription: string
  restrictedPatient: boolean
  currentIncentive?: {
    level: { code: string; description: string }
    dateTime: string
    nextReviewDate: string
  }
}

export type Aliase = {
  firstName: string
  middleNames?: string
  lastName: string
  dateOfBirth: string
  gender: string
  ethnicity?: string
}

export type Alert = {
  alertType: string
  alertCode: string
  active: boolean
  expired: boolean
}

export interface Incentive {
  level: { code: string; description: string }
  dateTime: string
  nextReviewDate: string
}
