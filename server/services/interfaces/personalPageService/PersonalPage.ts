import Address from './Address'
import GovSummaryItem from '../../../interfaces/GovSummaryItem'
import LearnerNeurodivergence from '../../../data/interfaces/curiousApi/LearnerNeurodivergence'
import { Result } from '../../../utils/result/result'
import {
  MilitaryRecord,
  PersonIntegrationDistinguishingMark,
} from '../../../data/interfaces/personIntegrationApi/personIntegrationApiClient'
import { PersonalRelationshipsContact } from '../../../data/interfaces/personalRelationshipsApi/personalRelationshipsApiClient'

export default interface PersonalPage {
  personalDetails: PersonalDetails
  identityNumbers: IdentityNumbers
  property: PropertyItem[]
  addresses: Addresses
  addressSummary: GovSummaryItem[]
  nextOfKin: NextOfKin[]
  nextOfKinAndEmergencyContacts: Result<NextOfKinAndEmergencyContactsDetails>
  physicalCharacteristics: PhysicalCharacteristics
  security: Security
  learnerNeurodivergence: Result<LearnerNeurodivergence[]>
  hasCurrentBelief: boolean
  distinguishingMarks: PersonIntegrationDistinguishingMark[] | null
  militaryRecords: MilitaryRecord[] | null
}

export interface PersonalDetails {
  age: { years: number; months: number }
  aliases: {
    alias: string
    dateOfBirth: string
    sex: string
  }[]
  dateOfBirth: string
  domesticAbusePerpetrator: string
  domesticAbuseVictim: string
  cityOrTownOfBirth: string
  countryOfBirth: string
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
  religionOrBelief: string
  sex: string
  sexualOrientation: string
  smokerOrVaper: string
  socialCareNeeded: string
  typeOfDiet: string
  youthOffender: string
  dietAndAllergy: DietAndAllergyDetails
}

export interface NextOfKinAndEmergencyContactsDetails {
  contacts: PersonalRelationshipsContact[]
  hasNextOfKin: boolean
  hasEmergencyContact: boolean
}

export interface DietAndAllergyDetails {
  foodAllergies: { id: string; description: string }[]
  medicalDietaryRequirements: { id: string; description: string; comment?: string }[]
  personalisedDietaryRequirements: { id: string; description: string; comment?: string }[]
  cateringInstructions: string
  lastModifiedAt: string
  lastModifiedPrison: string
}

export interface IdentityNumber {
  value: string
  comment?: string
}

export interface IdentityNumbers {
  justice: {
    croNumber: IdentityNumber[]
    localInmateDataSystemNumber: IdentityNumber[]
    pncNumber: IdentityNumber[]
    prisonLegacySystemNumber: IdentityNumber[]
    prisonNumber: string
    probationLegacySystemNumber: IdentityNumber[]
    scottishPncNumber: IdentityNumber[]
    yjafNumber: IdentityNumber[]
  }
  personal: {
    drivingLicenceNumber: IdentityNumber[]
    nationalInsuranceNumber: IdentityNumber[]
    parkrunNumber: IdentityNumber[]
    passportNumber: IdentityNumber[]
    staffIdentityCardNumber: IdentityNumber[]
    uniqueLearnerNumber: IdentityNumber[]
  }
  homeOffice: {
    caseInformationDatabase: IdentityNumber[]
    homeOfficeReferenceNumber: IdentityNumber[]
    portReferenceNumber: IdentityNumber[]
  }
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
