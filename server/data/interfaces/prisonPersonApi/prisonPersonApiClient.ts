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
}
