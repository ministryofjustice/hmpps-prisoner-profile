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
  religionHistory: ReligionHistoryItem[]
}

export interface ReligionHistoryItem {
  current: boolean
  religionCode: string
  religionDescription: string | null
  changeReasonKnown: boolean
  comments: string | null
  startDate: string
  endDate: string | null
  createUserId: string
  createDateTime: string
  modifyUserId: string | null
  modifyDateTime: string | null
  // NB: non-exhaustive
}

export interface UpdateReligionRequest {
  userId: string
  religionCode: string
  comment?: string | null
}

export interface PersonApiClient {
  // reference endpoints
  getReligionCodes(activeOnly?: boolean): Promise<PersonApiReferenceDataCode[]>

  // whole record endpoints
  getRecord(prisonerNumber: string, withReligionHistory?: false): Promise<PersonRecord>
  getRecord(prisonerNumber: string, withReligionHistory: true): Promise<DpsPersonRecord>
  getRecord(prisonerNumber: string, withReligionHistory?: boolean): Promise<PersonRecord | DpsPersonRecord>

  // religion endpoints
  getReligionHistory(prisonerNumber: string): Promise<ReligionHistoryItem[]>
  updateReligion(prisonerNumber: string, request: UpdateReligionRequest): Promise<void>
}
