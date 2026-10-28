export interface PersonApiReferenceDataCode {
  code: string
  description: string
  active: boolean
}

export interface PersonRecord {
  // NB: non-exhaustive
  identifiers: {
    prisonNumbers: string[]
  }
  religion: {
    code: string | null
    description: string | null
  }
}

export interface DpsPersonRecord extends PersonRecord {
  religionHistory: {
    // NB: non-exhaustive
    current: boolean
    religionCode: string
    religionDescription: string | null
    changeReasonKnown: boolean
    comments: string | null
    startDate: string
    endDate: string | null
    createUserId: string
  }[]
}

export interface PersonApiClient {
  getReligionCodes(activeOnly?: boolean): Promise<PersonApiReferenceDataCode[]>

  getRecord(prisonerNumber: string, withReligionHistory?: false): Promise<PersonRecord>
  getRecord(prisonerNumber: string, withReligionHistory: true): Promise<DpsPersonRecord>
  getRecord(prisonerNumber: string, withReligionHistory?: boolean): Promise<PersonRecord | DpsPersonRecord>
}
