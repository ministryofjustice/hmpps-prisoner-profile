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

// eslint-disable-next-line no-shadow
export enum ProxyReferenceDataDomain {
  country = 'COUNTRY',
}

export interface PersonIntegrationApiClient {
  updateBirthPlace(prisonerNumber: string, birthPlace: string): Promise<void>

  updateCountryOfBirth(prisonerNumber: string, countryOfBirth: string): Promise<void>

  getReferenceDataCodes(domain: ProxyReferenceDataDomain): Promise<ReferenceDataCodeDto[]>
}
