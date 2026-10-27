export interface PersonApiReferenceDataCode {
  code: string
  description: string
  active: boolean
}

interface PersonRecordIdentifiers {
  prisonNumbers?: string[]
}

export interface PersonRecord {
  identifiers?: PersonRecordIdentifiers
}

export interface PersonApiClient {
  getReligionCodes(activeOnly?: boolean): Promise<PersonApiReferenceDataCode[]>
  getRecord(prisonerNumber: string): Promise<PersonRecord>
}
