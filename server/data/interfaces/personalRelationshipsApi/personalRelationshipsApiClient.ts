import { QueryParams } from '../../../interfaces/QueryParams'

// eslint-disable-next-line no-shadow
export enum PersonalRelationshipType {
  Official = 'O',
  Social = 'S',
}

// eslint-disable-next-line no-shadow
export enum PersonalRelationshipsReferenceDataDomain {
  Title = 'TITLE',
  OfficialRelationship = 'OFFICIAL_RELATIONSHIP',
  SocialRelationship = 'SOCIAL_RELATIONSHIP',
  City = 'CITY',
  DomesticStatus = 'DOMESTIC_STS',
}

export interface PersonalRelationshipsReferenceCode {
  referenceCodeId: number
  groupCode: string
  code: string
  description: string
  displayOrder: number
  isActive: boolean
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

export interface PersonalRelationshipsContactCreationResultDto {
  createdContact: PersonalRelationshipContactDetails
}

export interface PersonalRelationshipContactDetails {
  id: number
  firstName: string
  lastName: string
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

export interface PersonalRelationshipsNumberOfChildrenDto {
  id: number
  numberOfChildren?: string
  active: boolean
  createdTime?: string
  createdBy?: string
}

export interface PersonalRelationshipsDomesticStatusDto {
  id: number
  domesticStatusCode: string
  domesticStatusDescription: string
  active: boolean
  createdTime?: string
  createdBy?: string
}

export interface PersonalRelationshipsNumberOfChildrenUpdateRequest {
  numberOfChildren: number
  requestedBy?: string
}

export interface PersonalRelationshipsDomesticStatusUpdateRequest {
  domesticStatusCode: string
  requestedBy?: string
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

export interface PersonalRelationshipsContactRequest {
  titleCode?: string
  lastName: string
  firstName: string
  middleNames?: string
  dateOfBirth?: string
  isStaff: boolean
  relationship: PersonalRelationshipsContactRequestRelationship
  addresses?: PersonalRelationshipsContactRequestAddress[]
  phoneNumbers?: PersonalRelationshipsContactRequestPhoneNumber[]
  createdBy: string
}

export interface PersonalRelationshipsContactRequestRelationship {
  prisonerNumber: string
  relationshipTypeCode: string
  relationshipToPrisonerCode: string
  isNextOfKin: boolean
  isEmergencyContact: boolean
  isApprovedVisitor: boolean
}

export interface PersonalRelationshipsContactRequestAddress {
  flat?: string
  property?: string
  street?: string
  area?: string
  cityCode?: string
  countyCode?: string
  postcode?: string
  countryCode?: string
  noFixedAddress: boolean
}

export interface PersonalRelationshipsContactRequestPhoneNumber {
  phoneType?: string
  phoneNumber?: string
  extNumber?: string
}

export interface PersonalRelationshipsAddContactAddressRequest {
  property?: string
  street?: string
  cityCode?: string
  postcode?: string
  noFixedAddress: boolean
  createdBy: string
}

export interface PersonalRelationshipsApiClient {
  getContacts(
    prisonerNumber: string,
    queryParams?: PersonalRelationshipsContactQueryParams,
  ): Promise<PersonalRelationshipsContactsDto>

  getContactCount(prisonerNumber: string): Promise<PersonalRelationshipsContactCount>

  createContact(contact: PersonalRelationshipsContactRequest): Promise<PersonalRelationshipsContactCreationResultDto>

  addContactAddress(contactId: number, address: PersonalRelationshipsContactRequestAddress): Promise<void>

  getNumberOfChildren(prisonerNumber: string): Promise<PersonalRelationshipsNumberOfChildrenDto>

  updateNumberOfChildren(
    prisonerNumber: string,
    updateRequest: PersonalRelationshipsNumberOfChildrenUpdateRequest,
  ): Promise<PersonalRelationshipsNumberOfChildrenDto>

  getDomesticStatus(prisonerNumber: string): Promise<PersonalRelationshipsDomesticStatusDto>

  updateDomesticStatus(
    prisonerNumber: string,
    updateRequest: PersonalRelationshipsDomesticStatusUpdateRequest,
  ): Promise<PersonalRelationshipsDomesticStatusDto>

  getReferenceDataCodes(domain: PersonalRelationshipsReferenceDataDomain): Promise<PersonalRelationshipsReferenceCode[]>
}
