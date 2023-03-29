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

export interface PersonalPage {
  personalDetails: PersonalDetails
  identityNumbers: IdentityNumbers
  property: PropertyItem[]
  addresses: Addresses
  nextOfKin: NextOfKin[]
}
