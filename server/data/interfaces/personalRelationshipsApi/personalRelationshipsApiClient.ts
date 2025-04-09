// eslint-disable-next-line no-shadow
export enum PersonalRelationshipType {
  Official = 'O',
  Social = 'S',
}

export interface ContactsDto {
  content: ContactDto[]
  page?: PaginationDto
}

export interface ContactDto {
  prisonerContactId: number
  contactId: number
  prisonerNumber: string
  firstName: string
  middleNames?: string
  lastName: string
  dateOfBirth?: string
  deceasedDate?: string
  relationshipTypeCode: string
  relationshipTypeDescription: string
  relationshipToPrisonerCode: string
  relationshipToPrisonerDescription: string
  flat?: string
  property?: string
  street?: string
  area?: string
  cityCode?: string
  cityDescription?: string
  countyCode?: string
  countyDescription?: string
  postcode?: string
  countryCode?: string
  countryDescription?: string
  primaryAddress?: boolean
  mailAddress?: boolean
  phoneType?: string
  phoneTypeDescription?: string
  phoneNumber?: string
  extNumber?: string
  isApprovedVisitor: boolean
  isNextOfKin: boolean
  isEmergencyContact: boolean
  isRelationshipActive: boolean
  currentTerm: boolean
  comments?: string
  restrictionSummary: RestrictionSummaryDto
}

export interface RestrictionSummaryDto {
  active: RestrictionDto[]
  totalActive: number
  totalExpired: number
}

export interface RestrictionDto {
  restrictionType: string
  restrictionTypeDescription: string
}

export interface PaginationDto {
  size?: number
  number?: number
  totalElements?: number
  totalPages?: number
}

export interface PersonalRelationshipsApiClient {
  getContacts(
    prisonerNumber: string,
    relationshipType?: PersonalRelationshipType,
    page?: number,
    size?: number,
  ): Promise<ContactsDto>
}
