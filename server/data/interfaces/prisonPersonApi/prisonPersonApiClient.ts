import { Readable } from 'stream'

export interface ValueWithMetadata<T> {
  value?: T
  lastModifiedAt: string
  lastModifiedBy: string
}

export interface PrisonPersonPhysicalAttributes {
  height?: ValueWithMetadata<number>
  weight?: ValueWithMetadata<number>
  shoeSize?: ValueWithMetadata<string>
  hair?: ValueWithMetadata<PrisonPersonCharacteristic>
  facialHair?: ValueWithMetadata<PrisonPersonCharacteristic>
  face?: ValueWithMetadata<PrisonPersonCharacteristic>
  build?: ValueWithMetadata<PrisonPersonCharacteristic>
  leftEyeColour?: ValueWithMetadata<PrisonPersonCharacteristic>
  rightEyeColour?: ValueWithMetadata<PrisonPersonCharacteristic>
}

export interface PrisonPersonPhysicalAttributesUpdate {
  height: number
  weight: number
  shoeSize: string
  hair: PrisonPersonCharacteristic
  facialHair: PrisonPersonCharacteristic
  face: PrisonPersonCharacteristic
  build: PrisonPersonCharacteristic
  leftEyeColour: PrisonPersonCharacteristic
  rightEyeColour: PrisonPersonCharacteristic
}

// eslint-disable-next-line no-shadow
export enum PrisonPersonCharacteristicCode {
  hair = 'hair',
  facialHair = 'facialHair',
  face = 'face',
  build = 'build',
  eye = 'eye',
}

export interface PrisonPersonCharacteristic {
  id: string
  description: string
}

export interface PrisonPerson {
  prisonerNumber: string
  physicalAttributes: PrisonPersonPhysicalAttributes
  health: PrisonPersonHealth
}

export interface ReferenceDataDomain {
  code: string
  description: string
  listSequence: number
  createdAt: string
  createdBy: string
  isActive: boolean
  lastModifiedAt?: string
  lastModifiedBy?: string
  deactivatedAt?: string
  deactivatedBy?: string
  referenceDataCodes?: ReferenceDataCode[]
}

export interface ReferenceDataCode {
  id: string
  domain: string
  code: string
  description: string
  listSequence: number
  createdAt: string
  createdBy: string
  isActive: boolean
  lastModifiedAt?: string
  lastModifiedBy?: string
  deactivatedAt?: string
  deactivatedBy?: string
}

export interface ReferenceDataCodeSimple {
  id: string
  description: string
  listSequence: number
  isActive: boolean
}

export interface FieldHistory {
  valueInt: number
  valueString: string
  valueRef: ReferenceDataCodeSimple
  appliesFrom: string
  appliesTo: string
  createdBy: string
  source: string
}

export interface PrisonPersonHealth {
  smokerOrVaper: ValueWithMetadata<ReferenceDataCodeSimple>
}

export interface PrisonPersonHealthUpdate {
  smokerOrVaper: string
}

export type BodyPartId =
  | 'BODY_PART_ANKLE'
  | 'BODY_PART_ARM'
  | 'BODY_PART_EAR'
  | 'BODY_PART_ELBOW'
  | 'BODY_PART_FACE'
  | 'BODY_PART_FINGER'
  | 'BODY_PART_FOOT'
  | 'BODY_PART_HAND'
  | 'BODY_PART_HEAD'
  | 'BODY_PART_KNEE'
  | 'BODY_PART_LEG'
  | 'BODY_PART_LIP'
  | 'BODY_PART_NECK'
  | 'BODY_PART_NOSE'
  | 'BODY_PART_SHOULDER'
  | 'BODY_PART_THIGH'
  | 'BODY_PART_TOE'
  | 'BODY_PART_TORSO'

export type MarkTypeId = 'MARK_TYPE_MARK' | 'MARK_TYPE_SCAR' | 'MARK_TYPE_TAT' | 'MARK_TYPE_OTH'
export type BodyPartSideId = 'SIDE_B' | 'SIDE_F' | 'SIDE_L' | 'SIDE_R' | 'SIDE_S'
export type PartOrientationId = 'PART_ORIENT_CENTR' | 'PART_ORIENT_FACE' | 'PART_ORIENT_LOW' | 'PART_ORIENT_UPP'

export interface PrisonPersonDistinguishingMark {
  id: string
  prisonerNumber: string
  bodyPart: ReferenceDataCodeSimple & { id: BodyPartId }
  markType: ReferenceDataCodeSimple & { id: MarkTypeId }
  side?: ReferenceDataCodeSimple & { id: BodyPartSideId }
  partOrientation?: ReferenceDataCodeSimple & { id: PartOrientationId }
  comment?: string
  photographUuids?: string[]
  createdBy: string
  createdAt: string
}

export interface PrisonPersonDistinguishingMarkRequest {
  prisonerNumber: string
  bodyPart: BodyPartId
  markType: MarkTypeId
  side?: BodyPartSideId
  partOrientation?: PartOrientationId
  comment?: string
}

export interface PrisonPersonApiClient {
  getPrisonPerson(prisonerNumber: string): Promise<PrisonPerson>

  updatePhysicalAttributes(
    prisonerNumber: string,
    physicalAttributes: Partial<PrisonPersonPhysicalAttributesUpdate>,
  ): Promise<PrisonPersonPhysicalAttributes>

  updateHealth(prisonerNumber: string, healthData: Partial<PrisonPersonHealthUpdate>): Promise<PrisonPerson>

  getReferenceDataDomains(includeInactive?: boolean): Promise<ReferenceDataDomain[]>

  getReferenceDataDomain(domain: string): Promise<ReferenceDataDomain>

  getReferenceDataCodes(domain: string, includeInactive?: boolean): Promise<ReferenceDataCode[]>

  getReferenceDataCode(domain: string, code: string): Promise<ReferenceDataCode>

  getFieldHistory(prisonerNumber: string, field: string): Promise<FieldHistory[]>

  getDistinguishingMarks(prisonerNumber: string): Promise<PrisonPersonDistinguishingMark[]>

  postDistinguishingMark(
    distinguishingMarkRequest: PrisonPersonDistinguishingMarkRequest,
  ): Promise<PrisonPersonDistinguishingMark>

  getImage(imageId: string): Promise<Readable>
}
