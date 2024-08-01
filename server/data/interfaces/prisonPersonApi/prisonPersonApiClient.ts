export interface PrisonPersonPhysicalAttributes {
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

export interface PrisonPersonApiClient {
  getPrisonPerson(prisonerNumber: string): Promise<PrisonPerson>
  updatePhysicalAttributes(
    prisonerNumber: string,
    physicalAttributes: Partial<PrisonPersonPhysicalAttributes>,
  ): Promise<PrisonPersonPhysicalAttributes>
  getReferenceDataDomains(includeInactive?: boolean): Promise<ReferenceDataDomain[]>
  getReferenceDataDomain(domain: string): Promise<ReferenceDataDomain>
  getReferenceDataCodes(domain: string, includeInactive?: boolean): Promise<ReferenceDataCode[]>
  getReferenceDataCode(domain: string, code: string): Promise<ReferenceDataCode>
}
