import Address from './Address'
import GovSummaryItem from '../../../interfaces/GovSummaryItem'
import LearnerNeurodivergence from '../../../data/interfaces/curiousApi/LearnerNeurodivergence'
import { PrisonPersonDistinguishingMark } from '../../../data/interfaces/prisonPersonApi/prisonPersonApiClient'

export default interface PersonalPage {
  personalDetails: PersonalDetails
  identityNumbers: IdentityNumbers
  property: PropertyItem[]
  addresses: Addresses
  addressSummary: GovSummaryItem[]
  nextOfKin: NextOfKin[]
  physicalCharacteristics: PhysicalCharacteristics
  security: Security
  learnerNeurodivergence: LearnerNeurodivergence[]
  hasCurrentBelief: boolean
  showFieldHistoryLink: boolean
  distinguishingMarks: PrisonPersonDistinguishingMark[] | null
}

export interface PersonalDetails {
  age: { years: number; months: number }
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
  youthOffender: string
  medicalDietaryRequirements: { id: string; description: string }[]
  foodAllergies: { id: string; description: string }[]
}

export interface IdentityNumber {
  value: string
  comment?: string
}

export interface IdentityNumbers {
  caseInformationDatabase: IdentityNumber[]
  croNumber: IdentityNumber[]
  didNotEnterPrisonTaggedBailRel: IdentityNumber[]
  drivingLicenceNumber: IdentityNumber[]
  homeOfficeReferenceNumber: IdentityNumber[]
  localInmateDataSystemNumber: IdentityNumber[]
  nationalInsuranceNumber: IdentityNumber[]
  parkrunNumber: IdentityNumber[]
  passportNumber: IdentityNumber[]
  pncNumber: IdentityNumber[]
  portReferenceNumber: IdentityNumber[]
  prisonLegacySystemNumber: IdentityNumber[]
  prisonNumber: string
  probationLegacySystemNumber: IdentityNumber[]
  scottishPncNumber: IdentityNumber[]
  staffIdentityCardNumber: IdentityNumber[]
  uniqueLearnerNumber: IdentityNumber[]
  yjafNumber: IdentityNumber[]
}

export interface PropertyItem {
  containerType: string
  sealMark: string
  location: string
}

export interface Addresses {
  isPrimaryAddress: boolean
  noFixedAddress: boolean
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
