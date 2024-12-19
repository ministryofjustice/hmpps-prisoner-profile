export interface BirthplaceUpdateDto {
  fieldName: string
  value: string
}

export interface ReferenceDataCodeDto {
  id: string
  code: string
  description: string
  listSequence: number
  isActive: boolean
}

export interface PersonIntegrationApiClient {
  updateBirthPlace(prisonerNumber: string, birthPlace: string): Promise<void>

  getReferenceDataCodes(domain: string): Promise<ReferenceDataCodeDto[]>
}
