import { Address } from './prisonApi/address'

export interface StaffContacts {
  keyWorker: KeyWorkerUI
  prisonOffenderManager: string
  coworkingPrisonOffenderManager: string
  communityOffenderManager: string
  linkUrl: string
}

export interface KeyWorkerUI {
  name: string
  lastSession: string
}

export interface Contact {
  lastName: string
  firstName: string
  middleName: string
  contactType: string
  contactTypeDescription: string
  relationship: string
  relationshipDescription: string
  commentText: string
  emergencyContact: boolean
  nextOfKin: boolean
  relationshipId: number
  personId: number
  activeFlag: boolean
  expiryDate: string
  approvedVisitorFlag: boolean
  canBeContactedFlag: boolean
  awareOfChargesFlag: boolean
  contactRootOffenderId: number
  bookingId: number
  createDateTime: string
}
export interface ContactDetail {
  bookingId: number
  nextOfKin: Contact[]
  otherContacts: Contact[]
}

export interface PrisonerContactWithContactDetails extends Contact {
  address: Address & { label: string }
  emails: string[]
  phones: string[]
}

export interface PomContact {
  name: string
  jobTitle: string
}
