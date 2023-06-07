import { Address } from '../address'

export interface PersonalDetails {
  age: string
  aliases: {
    alias: string
    dateOfBirth: string
  }[]
  dateOfBirth: string
  domesticAbusePerpetrator: string
  domesticAbuseVictim: string
  ethnicGroup: string
  fullName: string
  languages: {
    spoken: string
    written: string
    interpreterRequired: boolean
  }
  marriageOrCivilPartnership: string
  nationality: string
  numberOfChildren: string
  otherLanguages: {
    language: string
    code: string
    canRead: boolean
    canSpeak: boolean
    canWrite: boolean
  }[]
  otherNationalities: string
  placeOfBirth: string
  preferredName: string
  religionOrBelief: string
  sex: string
  sexualOrientation: string
  smokerOrVaper: string
  socialCareNeeded: string
  typeOfDiet: string
}
export interface IdentityNumbers {
  croNumber: string
  drivingLicenceNumber: string
  homeOfficeReferenceNumber: string
  nationalInsuranceNumber: string
  pncNumber: string
  prisonNumber: string
}

export interface PropertyItem {
  containerType: string
  sealMark: string
  location: string
}

export interface Addresses {
  isPrimaryAddress: boolean
  address: Address
  comment: string
  addressTypes: string[]
  phones: string[]
  addedOn: string
}

export interface NextOfKin {
  emergencyContact: boolean
  nextOfKin: boolean
  name: string
  relationship: string
  emails: string[]
  phones: string[]
  address: Addresses
}

export interface DistinguishingMark {
  bodyPart: string
  type: string
  side: string
  orientation: string
  comment: string
  imageId: number
}
export interface PhysicalCharacteristics {
  height: string
  weight: string
  hairColour: string
  leftEyeColour: string
  rightEyeColour: string
  facialHair: string
  shapeOfFace: string
  build: string
  shoeSize: string
  warnedAboutTattooing: string
  warnedNotToChangeAppearance: string
  distinguishingMarks: DistinguishingMark[]
}

export interface Security {
  interestToImmigration: string
  travelRestrictions: string
}

export interface CareNeed {
  type: string
  description: string
  comment: string
  startDate: string
}

export interface ReasonableAdjustment {
  type: string
  description: string
  comment: string
  startDate: string
  agency: string
}

export interface CareNeeds {
  personalCareNeeds: CareNeed[]
  reasonableAdjustments: ReasonableAdjustment[]
}

export interface PersonalPage {
  personalDetails: PersonalDetails
  identityNumbers: IdentityNumbers
  property: PropertyItem[]
  addresses: Addresses
  nextOfKin: NextOfKin[]
  physicalCharacteristics: PhysicalCharacteristics
  security: Security
  careNeeds: CareNeeds
}
