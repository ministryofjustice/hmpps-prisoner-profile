import { Readable } from 'stream'
import { ReferenceDataValue } from '../prisonApi/ReferenceDataValue'
import MulterFile from '../../../controllers/interfaces/MulterFile'

export interface CorePersonRecordReferenceDataCodeDto {
  id: string
  code: string
  description: string
  listSequence: number
  isActive: boolean
  parentCode?: string
  parentDomain?: string
}

// eslint-disable-next-line no-shadow
export enum CorePersonRecordReferenceDataDomain {
  country = 'COUNTRY',
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
  language = 'LANG',
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

export interface PersonIntegrationApiClient {
  updateBirthPlace(prisonerNumber: string, birthPlace: string): Promise<void>

  updateCountryOfBirth(prisonerNumber: string, countryOfBirth: string): Promise<void>

  updateNationality(prisonerNumber: string, nationality: string, otherNationalities: string): Promise<void>

  updateReligion(prisonerNumber: string, religion: string, reasonForChange?: string): Promise<void>

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
}
