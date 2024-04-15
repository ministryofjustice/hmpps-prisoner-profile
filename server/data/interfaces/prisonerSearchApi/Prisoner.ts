import Assessment from '../prisonApi/Assessment'

export default interface Prisoner {
  prisonerNumber: string
  pncNumber?: string
  pncNumberCanonicalShort?: string
  pncNumberCanonicalLong?: string
  croNumber?: string
  bookingId?: number
  bookNumber?: string
  firstName: string
  middleNames?: string
  lastName: string
  dateOfBirth: string
  gender: string
  ethnicity: string
  youthOffender: boolean
  maritalStatus: string
  religion: string
  nationality: string
  status: string
  lastMovementTypeCode?: string
  lastMovementReasonCode?: string
  inOutStatus?: 'IN' | 'OUT' | 'TRN'
  prisonId?: string
  prisonName?: string
  cellLocation?: string
  aliases?: Alias[]
  alerts?: Alert[]
  csra?: string
  assessments?: Assessment[]
  category?: string
  legalStatus?:
    | 'RECALL'
    | 'DEAD'
    | 'INDETERMINATE_SENTENCE'
    | 'SENTENCED'
    | 'CONVICTED_UNSENTENCED'
    | 'CIVIL_PRISONER'
    | 'IMMIGRATION_DETAINEE'
    | 'REMAND'
    | 'UNKNOWN'
    | 'OTHER'
  imprisonmentStatus?: string
  imprisonmentStatusDescription?: string
  mostSeriousOffence: string
  recall?: boolean
  indeterminateSentence?: boolean
  sentenceStartDate?: string
  releaseDate?: string
  confirmedReleaseDate?: string
  sentenceExpiryDate?: string
  licenceExpiryDate?: string
  homeDetentionCurfewEligibilityDate?: string
  homeDetentionCurfewActualDate?: string
  homeDetentionCurfewEndDate?: string
  topupSupervisionStartDate?: string
  topupSupervisionExpiryDate?: string
  additionalDaysAwarded?: number
  nonDtoReleaseDate?: string
  nonDtoReleaseDateType?: 'ARD' | 'CRD' | 'NPD' | 'PRRD'
  receptionDate?: string
  paroleEligibilityDate?: string
  automaticReleaseDate?: string
  postRecallReleaseDate?: string
  conditionalReleaseDate?: string
  actualParoleDate?: string
  tariffDate?: string
  locationDescription?: string
  restrictedPatient: boolean
  supportingPrisonId?: string
  dischargedHospitalId?: string
  dischargedHospitalDescription?: string
  dischargeDate?: string
  dischargeDetails?: string
  currentIncentive?: Incentive
  heightCentimetres?: number
  weightKilograms?: number
  hairColour?:
    | 'Bald'
    | 'Balding'
    | 'Black'
    | 'Blonde'
    | 'Brown'
    | 'Brunette'
    | 'Dark'
    | 'Dyed'
    | 'Ginger'
    | 'Grey'
    | 'Light'
    | 'Mouse'
    | 'Multi-coloured'
    | 'Red'
    | 'White'
  rightEyeColour?: 'Blue' | 'Brown' | 'Clouded' | 'Green' | 'Grey' | 'Hazel' | 'Missing' | 'Pink' | 'White'
  leftEyeColour?: 'Blue' | 'Brown' | 'Clouded' | 'Green' | 'Grey' | 'Hazel' | 'Missing' | 'Pink' | 'White'
  facialHair?:
    | 'Full Beard'
    | 'Clean Shaven'
    | 'Goatee Beard'
    | 'Moustache Only'
    | 'Not Applicable (Female Offender)'
    | 'No Facial Hair'
    | 'Sideburns'
  shapeOfFace?: 'Angular' | 'Bullet' | 'Oval' | 'Round' | 'Square' | 'Triangular'
  build?:
    | 'Fat'
    | 'Frail'
    | 'Heavy'
    | 'Medium'
    | 'Muscular'
    | 'Obese'
    | 'Proportional'
    | 'Slight'
    | 'Small'
    | 'Stocky'
    | 'Stooped'
    | 'Thin'
  shoeSize?: number
  tattoos?: BodyPartDetail[]
  scars?: BodyPartDetail[]
  marks?: BodyPartDetail[]
}

export interface Alias {
  firstName: string
  middleNames?: string
  lastName: string
  dateOfBirth: string
  gender: string
  ethnicity?: string
}

export interface Alert {
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

export interface BodyPartDetail {
  bodyPart?:
    | 'Ankle'
    | 'Arm'
    | 'Ear'
    | 'Elbow'
    | 'Face'
    | 'Finger'
    | 'Foot'
    | 'Hand'
    | 'Head'
    | 'Knee'
    | 'Leg'
    | 'Lip'
    | 'Neck'
    | 'Nose'
    | 'Shoulder'
    | 'Thigh'
    | 'Toe'
    | 'Torso'

  comment?: string
}
