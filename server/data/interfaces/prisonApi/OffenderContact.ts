import Telephone from './Telephone'

export interface VisitorRestriction {
  restrictionId: number
  comment?: string
  restrictionType: string
  restrictionTypeDescription: string
  startDate: string
  expiryDate?: string
  globalRestriction: boolean
}

export default interface OffenderContact {
  lastName: string
  firstName: string
  middleName?: string
  dateOfBirth?: string
  contactType: string
  contactTypeDescription?: string
  relationshipCode: string
  relationshipDescription?: string
  commentText?: string
  emergencyContact: boolean
  nextOfKin: boolean
  personId?: number
  approvedVisitor: boolean
  bookingId: number
  emails?: {
    email: string
  }[]
  phones?: Telephone[]
  restrictions?: VisitorRestriction[]
  active: boolean
}

export interface OffenderContacts {
  offenderContacts: OffenderContact[]
}
