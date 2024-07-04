export interface PrisonPersonPhysicalAttributes {
  height: number
  weight: number
}

export interface PrisonPersonCharacteristic {
  code: string
  description: string
}

export interface PrisonPersonPhysicalCharacteristics {
  hair: PrisonPersonCharacteristic
  facialHair: PrisonPersonCharacteristic
  faceShape: PrisonPersonCharacteristic
  build: PrisonPersonCharacteristic
}

export interface PrisonPerson {
  prisonerNumber: string
  physicalAttributes: PrisonPersonPhysicalAttributes
  physicalCharacteristics: PrisonPersonPhysicalCharacteristics
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
}
