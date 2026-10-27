interface PersonRecordIdentifiers {
  prisonNumbers?: string[]
}

export interface PersonRecord {
  identifiers?: PersonRecordIdentifiers
}

export interface PersonApiClient {
  getRecord(prisonerNumber: string): Promise<PersonRecord>
}
