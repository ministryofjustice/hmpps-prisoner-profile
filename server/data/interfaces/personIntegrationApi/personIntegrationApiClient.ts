export interface CorePersonRecordReferenceDataCodeDto {
  id: string
  code: string
  description: string
  listSequence: number
  isActive: boolean
  parentCode?: string
}

// eslint-disable-next-line no-shadow
export enum CorePersonRecordReferenceDataDomain {
  country = 'COUNTRY',
  nationality = 'NAT',
  religion = 'RELF',
  militaryBranch = 'MLTY_BRANCH',
  militaryRank = 'MLTY_RANK',
  militaryDischarge = 'MLTY_DSCHRG',
  disciplinaryAction = 'MLTY_DISCP',
  warZone = 'MLTY_WZONE',
}

export interface MilitaryRecord {
  prisonerNumber?: string
  militarySeq?: number
  warZoneCode?: string
  warZoneDescription?: string
  startDate: string
  endDate?: string
  militaryDischargeCode?: string
  militaryDischargeDescription?: string
  militaryBranchCode: string
  militaryBranchDescription?: string
  description?: string
  unitNumber?: string
  enlistmentLocation?: string
  dischargeLocation?: string
  selectiveServicesFlag?: boolean
  militaryRankCode?: string
  militaryRankDescription?: string
  serviceNumber?: string
  disciplinaryActionCode?: string
  disciplinaryActionDescription?: string
}

export interface MilitaryServiceInformation {
  militarySeq?: number
  startDate?: string
  'startDate-year'?: string
  'startDate-month'?: string
  militaryBranchCode: string
  militaryRankCode?: string
  description?: string
  unitNumber?: string
  enlistmentLocation?: string
  serviceNumber?: string
}

export interface Conflicts {
  militarySeq?: number
  warZoneCode?: string
}

export interface PersonIntegrationApiClient {
  updateBirthPlace(prisonerNumber: string, birthPlace: string): Promise<void>

  updateCountryOfBirth(prisonerNumber: string, countryOfBirth: string): Promise<void>

  updateNationality(prisonerNumber: string, nationality: string, otherNationalities: string): Promise<void>

  updateReligion(prisonerNumber: string, religion: string, reasonForChange?: string): Promise<void>

  getReferenceDataCodes(domain: CorePersonRecordReferenceDataDomain): Promise<CorePersonRecordReferenceDataCodeDto[]>

  getMilitaryRecords(prisonerNumber: string): Promise<MilitaryRecord[]>

  updateMilitaryRecord(prisonerNumber: string, militaryRecord: MilitaryRecord): Promise<void>

  createMilitaryRecord(prisonerNumber: string, militaryRecord: MilitaryRecord): Promise<void>
}
