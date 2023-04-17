export interface StaffContacts {
  keyWorker: KeyWorkerUI
  prisonOffenderManager: string
  coworkingPrisonOffenderManager: string
  communityOffenderManager: string
}

export interface KeyWorkerUI {
  name: string
  lastSession: string
}

export interface ContactDetail {
  bookingId: number
  nextOfKin: [
    {
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
    },
  ]
  otherContacts: [
    {
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
    },
  ]
}
