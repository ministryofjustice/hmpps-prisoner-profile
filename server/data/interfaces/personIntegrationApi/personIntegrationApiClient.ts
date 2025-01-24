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
  nationality = 'NAT',
  religion = 'RELF',
}

export interface MilitaryRecord {
  prisonerNumber: string
  militarySeq: number
  warZoneCode?: string
  warZoneDescription?: string
  startDate: string
  endDate?: string
  militaryDischargeCode?: string
  militaryDischargeDescription?: string
  militaryBranchCode: string
  militaryBranchDescription: string
  description?: string
  unitNumber?: string
  enlistmentLocation?: string
  dischargeLocation?: string
  selectiveServicesFlag: boolean
  militaryRankCode?: string
  militaryRankDescription?: string
  serviceNumber?: string
  disciplinaryActionCode?: string
  disciplinaryActionDescription?: string
}

export interface PersonIntegrationApiClient {
  updateBirthPlace(prisonerNumber: string, birthPlace: string): Promise<void>
  updateCountryOfBirth(prisonerNumber: string, countryOfBirth: string): Promise<void>
  updateNationality(prisonerNumber: string, nationality: string, otherNationalities: string): Promise<void>
  updateReligion(prisonerNumber: string, religion: string, reasonForChange?: string): Promise<void>
  getReferenceDataCodes(domain: ProxyReferenceDataDomain): Promise<ReferenceDataCodeDto[]>
  getMilitaryRecords(prisonerNumber: string): Promise<MilitaryRecord[]>
}
