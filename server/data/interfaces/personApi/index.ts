export interface PersonApiReferenceDataCode {
  code: string
  description: string
  active: boolean
}

interface PersonRecordIdentifiers {
  prisonNumbers: string[]
  // NB: non-exhaustive
}

export interface PersonRecord {
  identifiers: PersonRecordIdentifiers
  // NB: non-exhaustive
}

export interface PersonApiClient {
  getReligionCodes(activeOnly?: boolean): Promise<PersonApiReferenceDataCode[]>
  getRecord(prisonerNumber: string): Promise<PersonRecord>
}
