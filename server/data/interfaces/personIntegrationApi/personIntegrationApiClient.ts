export interface BirthplaceUpdateDto {
  fieldName: string
  value: string
}

export interface PersonIntegrationApiClient {
  updateBirthPlace(prisonerNumber: string, birthPlace: string): Promise<void>
}
