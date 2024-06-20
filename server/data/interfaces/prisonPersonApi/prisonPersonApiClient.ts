export interface PrisonPersonPhysicalAttributes {
  height: number
  weight: number
}

export interface PrisonPerson {
  prisonerNumber: string
  physicalAttributes: PrisonPersonPhysicalAttributes
}

export interface PrisonPersonApiClient {
  getPrisonPerson(prisonerNumber: string): Promise<PrisonPerson>
  updatePhysicalAttributes(
    prisonerNumber: string,
    physicalAttributes: Partial<PrisonPersonPhysicalAttributes>,
  ): Promise<PrisonPersonPhysicalAttributes>
}
