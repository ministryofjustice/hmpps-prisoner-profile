import { Readable } from 'stream'
import { ReferenceDataValue } from '../ReferenceDataValue'
import MulterFile from '../../../controllers/interfaces/MulterFile'
import { CorePersonPhysicalAttributes } from '../../../services/interfaces/corePerson/corePersonPhysicalAttributes'

export interface PrisonerProfileSummary {
  pseudonyms: PseudonymResponseDto[]
  addresses: AddressResponseDto[]
  contacts: ContactsResponseDto[]
  militaryRecords: MilitaryRecord[]
  physicalAttributes: CorePersonPhysicalAttributesDto
  distinguishingMarks: PersonIntegrationDistinguishingMark[]
}

export interface CorePersonRecordReferenceDataCodeDto {
  id: string
  code: string
  description: string
  listSequence: number
  isActive: boolean
  parentCode?: string
  parentDomain?: string
}

export enum CorePersonRecordReferenceDataDomain {
  country = 'COUNTRY',
  county = 'COUNTY',
  city = 'CITY',
  nationality = 'NAT',
  religion = 'RELF',
  militaryBranch = 'MLTY_BRANCH',
  militaryRank = 'MLTY_RANK',
  militaryDischarge = 'MLTY_DSCHRG',
  disciplinaryAction = 'MLTY_DISCP',
  warZone = 'MLTY_WZONE',
  hair = 'HAIR',
  facialHair = 'FACIAL_HAIR',
  face = 'FACE',
  build = 'BUILD',
  leftEyeColour = 'L_EYE_C',
  rightEyeColour = 'R_EYE_C',
  sexualOrientation = 'SEXO',
  ethnicity = 'ETHNICITY',
  phoneTypes = 'PHONE_USAGE',
}

export interface MilitaryRecord {
  prisonerNumber?: string
  militarySeq?: number
  warZoneCode?: string
  warZoneDescription?: string
  startDate: string
  endDate?: string
  militaryDischargeCode?: string
  militaryDischargeDescription?: string
  militaryBranchCode: string
  militaryBranchDescription?: string
  description?: string
  unitNumber?: string
  enlistmentLocation?: string
  dischargeLocation?: string
  selectiveServicesFlag?: boolean
  militaryRankCode?: string
  militaryRankDescription?: string
  serviceNumber?: string
  disciplinaryActionCode?: string
  disciplinaryActionDescription?: string
}

export interface MilitaryServiceInformation {
  militarySeq?: number
  startDate?: string
  'startDate-year'?: string
  'startDate-month'?: string
  militaryBranchCode: string
  militaryRankCode?: string
  description?: string
  unitNumber?: string
  enlistmentLocation?: string
  serviceNumber?: string
}

export interface Conflicts {
  militarySeq?: number
  warZoneCode?: string
}

export interface DisciplinaryAction {
  militarySeq?: number
  disciplinaryActionCode?: string
}

export interface DischargeDetails {
  militarySeq?: number
  endDate?: string
  'endDate-year'?: string
  'endDate-month'?: string
  militaryDischargeCode?: string
  dischargeLocation?: string
}

export interface CorePersonPhysicalAttributesDto {
  height?: number
  weight?: number
  hair?: ReferenceDataValue
  facialHair?: ReferenceDataValue
  face?: ReferenceDataValue
  build?: ReferenceDataValue
  leftEyeColour?: ReferenceDataValue
  rightEyeColour?: ReferenceDataValue
  shoeSize?: string
}

export interface CorePersonPhysicalAttributesRequest {
  height?: number
  weight?: number
  hairCode?: string
  facialHairCode?: string
  faceCode?: string
  buildCode?: string
  leftEyeColourCode?: string
  rightEyeColourCode?: string
  shoeSize?: string
}

export type BodyPartId =
  | 'ANKLE'
  | 'ARM'
  | 'EAR'
  | 'ELBOW'
  | 'FACE'
  | 'FINGER'
  | 'FOOT'
  | 'HAND'
  | 'HEAD'
  | 'KNEE'
  | 'LEG'
  | 'LIP'
  | 'NECK'
  | 'NOSE'
  | 'SHOULDER'
  | 'THIGH'
  | 'TOE'
  | 'TORSO'

export type MarkTypeId = 'MARK' | 'SCAR' | 'TAT' | 'OTH'
export type BodyPartSideId = 'B' | 'F' | 'L' | 'R' | 'S'
export type PartOrientationId = 'CENTR' | 'FACE' | 'LOW' | 'UPP'

export interface PersonIntegrationDistinguishingMark {
  id: number
  bookingId: number
  offenderNo: string
  bodyPart: ReferenceDataValue & { code: BodyPartId }
  markType: ReferenceDataValue & { code: MarkTypeId }
  side?: ReferenceDataValue & { code: BodyPartSideId }
  partOrientation?: ReferenceDataValue & { code: PartOrientationId }
  comment?: string
  createdAt: string
  createdBy: string
  photographUuids?: PersonIntegrationDistinguishingMarkImageDetail[]
}

export interface PersonIntegrationDistinguishingMarkImageDetail {
  id: number
  latest: boolean
}

export interface DistinguishingMarkRequest {
  bodyPart?: string
  markType?: string
  side?: string
  partOrientation?: string
  comment?: string
}

export interface PseudonymRequestDto {
  firstName: string
  middleName1?: string
  middleName2?: string
  lastName: string
  dateOfBirth: string
  sex: string
  nameType?: string
  title?: string
  ethnicity?: string
  isWorkingName: boolean
}

export interface PseudonymResponseDto {
  personId?: string
  sourceSystemId: number
  sourceSystem: string
  prisonerNumber: string
  firstName: string
  middleName1?: string
  middleName2?: string
  lastName: string
  dateOfBirth: string
  sex?: ReferenceDataValue
  nameType?: ReferenceDataValue
  title?: ReferenceDataValue
  ethnicity?: ReferenceDataValue
  isWorkingName: boolean
}

export interface AddressTypeDto {
  addressUsageType: ReferenceDataValue
  active?: boolean
}

export interface AddressRequestDto {
  uprn?: number
  noFixedAbode?: boolean
  buildingNumber?: string
  subBuildingName?: string
  buildingName?: string
  thoroughfareName?: string
  dependantLocality?: string
  postTownCode?: string
  countyCode?: string
  countryCode?: string
  postCode?: string
  fromDate: string
  toDate?: string
  addressTypes: string[]
  postalAddress?: boolean
  primaryAddress?: boolean
}

export interface AddressResponseDto {
  addressId: number
  personId: string
  uprn?: number
  noFixedAbode?: boolean
  buildingNumber?: string
  subBuildingName?: string
  buildingName?: string
  thoroughfareName?: string
  dependantLocality?: string
  postTown?: ReferenceDataValue
  county?: ReferenceDataValue
  country?: ReferenceDataValue
  postCode?: string
  fromDate: string
  toDate?: string
  addressTypes: AddressTypeDto[]
  postalAddress?: boolean
  primaryAddress?: boolean
  comment?: string
  addressPhoneNumbers?: ContactsResponseDto[]
}

export interface ContactsResponseDto {
  contactId: number
  contactType: string
  contactValue: string
  contactPhoneExtension?: string
}

export interface ContactsRequestDto {
  contactType: string
  contactValue: string
  contactPhoneExtension?: string
}

export interface AddIdentifierRequestDto {
  type: string
  value: string
  comments?: string
}

export interface UpdateIdentifierRequestDto {
  value: string
  comments?: string
}

export interface PersonIntegrationApiClient {
  getPrisonerProfileSummary(prisonerNumber: string): Promise<PrisonerProfileSummary>

  updateBirthPlace(prisonerNumber: string, birthPlace: string): Promise<void>

  updateCountryOfBirth(prisonerNumber: string, countryOfBirth: string): Promise<void>

  updateNationality(prisonerNumber: string, nationality: string, otherNationalities: string): Promise<void>

  updateReligion(prisonerNumber: string, religion: string, reasonForChange?: string): Promise<void>

  updateSexualOrientation(prisonerNumber: string, sexualOrientation: string): Promise<void>

  getReferenceDataCodes(domain: CorePersonRecordReferenceDataDomain): Promise<CorePersonRecordReferenceDataCodeDto[]>

  getMilitaryRecords(prisonerNumber: string): Promise<MilitaryRecord[]>

  updateMilitaryRecord(prisonerNumber: string, militarySeq: number, militaryRecord: MilitaryRecord): Promise<void>

  createMilitaryRecord(prisonerNumber: string, militaryRecord: MilitaryRecord): Promise<void>

  getPhysicalAttributes(prisonerNumber: string): Promise<CorePersonPhysicalAttributesDto>

  updatePhysicalAttributes(
    prisonerNumber: string,
    physicalAttributes: CorePersonPhysicalAttributesRequest,
  ): Promise<void>

  getDistinguishingMark(prisonerNumber: string, sequenceId: string): Promise<PersonIntegrationDistinguishingMark>

  getDistinguishingMarks(prisonerNumber: string): Promise<PersonIntegrationDistinguishingMark[]>

  createDistinguishingMark(
    prisonerNumber: string,
    distinguishingMarkRequest: DistinguishingMarkRequest,
    image?: MulterFile,
  ): Promise<PersonIntegrationDistinguishingMark>

  updateDistinguishingMark(
    prisonerNumber: string,
    sequenceId: string,
    distinguishingMarkRequest: DistinguishingMarkRequest,
  ): Promise<PersonIntegrationDistinguishingMark>

  addDistinguishingMarkImage(
    prisonerNumber: string,
    sequenceId: string,
    image: MulterFile,
  ): Promise<PersonIntegrationDistinguishingMark>

  updateDistinguishingMarkImage(imageId: string, image: MulterFile): Promise<PersonIntegrationDistinguishingMark>

  getDistinguishingMarkImage(imageId: string): Promise<Readable>

  getPseudonyms(prisonerNumber: string): Promise<PseudonymResponseDto[]>

  updatePseudonym(pseudonymId: number, pseudonym: PseudonymRequestDto): Promise<PseudonymResponseDto>

  createPseudonym(prisonerNumber: string, pseudonym: PseudonymRequestDto): Promise<PseudonymResponseDto>

  updateIdentityNumber(offenderId: number, seqId: number, request: UpdateIdentifierRequestDto): Promise<void>

  addIdentityNumbers(prisonerNumber: string, request: AddIdentifierRequestDto[]): Promise<void>

  updateProfileImage(
    prisonerNumber: string,
    image: { buffer: Buffer<ArrayBufferLike>; originalname: string },
  ): Promise<void>

  getAddresses(prisonerNumber: string): Promise<AddressResponseDto[]>

  createAddress(prisonerNumber: string, address: AddressRequestDto): Promise<AddressResponseDto>

  getContacts(prisonerNumber: string): Promise<ContactsResponseDto[]>

  createContact(prisonerNumber: string, request: ContactsRequestDto): Promise<ContactsResponseDto>

  updateContact(prisonerNumber: string, contactId: string, request: ContactsRequestDto): Promise<ContactsResponseDto>
}
