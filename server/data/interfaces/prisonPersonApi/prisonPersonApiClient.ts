export interface PrisonPersonPhysicalAttributes {
  height: number
  weight: number
  shoeSize: string
}

export interface PrisonPersonCharacteristic {
  code: string
  description: string
}

export interface PrisonPersonPhysicalCharacteristics {
  hair: PrisonPersonCharacteristic
  facialHair: PrisonPersonCharacteristic
  face: PrisonPersonCharacteristic
  build: PrisonPersonCharacteristic
}

export interface PrisonPerson {
  prisonerNumber: string
  physicalAttributes: PrisonPersonPhysicalAttributes
  physicalCharacteristics: PrisonPersonPhysicalCharacteristics
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
  updatePhysicalCharacteristics(
    prisonerNumber: string,
    physicalCharacteristics: Partial<PrisonPersonPhysicalCharacteristics>,
  ): Promise<PrisonPersonPhysicalCharacteristics>
  getReferenceDataDomains(includeInactive?: boolean): Promise<ReferenceDataDomain[]>
  getReferenceDataDomain(domain: string): Promise<ReferenceDataDomain>
  getReferenceDataCodes(domain: string, includeInactive?: boolean): Promise<ReferenceDataCode[]>
  getReferenceDataCode(domain: string, code: string): Promise<ReferenceDataCode>
}
