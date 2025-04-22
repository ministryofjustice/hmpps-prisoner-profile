import { QueryParams } from '../../../interfaces/QueryParams'

// eslint-disable-next-line no-shadow
export enum PersonalRelationshipType {
  Official = 'O',
  Social = 'S',
}

export interface PersonalRelationshipsContactsDto {
  content: PersonalRelationshipsContact[]
  page?: PersonalRelationshipsPaginationDto
}

export interface PersonalRelationshipsContact {
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
  restrictionSummary: PersonalRelationshipsRestrictionSummary
}

export interface PersonalRelationshipsRestrictionSummary {
  active: PersonalRelationshipsRestriction[]
  totalActive: number
  totalExpired: number
}

export interface PersonalRelationshipsRestriction {
  restrictionType: string
  restrictionTypeDescription: string
}

export interface PersonalRelationshipsPaginationDto {
  size?: number
  number?: number
  totalElements?: number
  totalPages?: number
}

export interface PersonalRelationshipsContactQueryParams extends QueryParams {
  emergencyContactOrNextOfKin?: boolean
  isRelationshipActive?: boolean
  relationshipType?: PersonalRelationshipType
  page?: number
  size?: number
}

export interface PersonalRelationshipsContactCount {
  official: number
  social: number
}

export interface PersonalRelationshipsApiClient {
  getContacts(
    prisonerNumber: string,
    queryParams?: PersonalRelationshipsContactQueryParams,
  ): Promise<PersonalRelationshipsContactsDto>
  getContactCount(prisonerNumber: string): Promise<PersonalRelationshipsContactCount>
}
