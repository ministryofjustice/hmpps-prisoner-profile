export default interface StaffContacts {
  keyWorker: PromiseSettledResult<KeyWorkerSummary>
  prisonOffenderManager: string
  coworkingPrisonOffenderManager: string
  communityOffenderManager: string
  linkUrl: string
}

export interface YouthStaffContacts {
  cuspOfficer: string
  cuspOfficerBackup: string
  youthJusticeWorker: string
  resettlementPractitioner: string
  youthJusticeService: string
  linkUrl: string
}

export interface KeyWorkerSummary {
  name: string
  lastSession: string
}

export interface Contact {
  lastName: string
  firstName: string
  middleName?: string
  contactType: string
  contactTypeDescription: string
  relationship: string
  relationshipDescription: string
  commentText?: string
  emergencyContact: boolean
  nextOfKin: boolean
  relationshipId: number
  personId: number
  activeFlag: boolean
  expiryDate?: string
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

export interface PomContact {
  name: string
  jobTitle: string
}
