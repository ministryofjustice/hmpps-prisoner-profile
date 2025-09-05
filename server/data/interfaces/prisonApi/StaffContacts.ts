export default interface StaffContacts {
  keyWorker: PromiseSettledResult<string>
  personalOfficer: PromiseSettledResult<string>
  lastSession: PromiseSettledResult<string>
  prisonOffenderManager: PromiseSettledResult<string>
  coworkingPrisonOffenderManager: PromiseSettledResult<string>
  communityOffenderManager: PromiseSettledResult<string>
  resettlementWorker: string
}

export interface YouthStaffContacts {
  cuspOfficer: string | null
  cuspOfficerBackup: string | null
  youthJusticeWorker: string | null
  resettlementPractitioner: string | null
  youthJusticeService: string | null
  youthJusticeServiceCaseManager: string | null
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
