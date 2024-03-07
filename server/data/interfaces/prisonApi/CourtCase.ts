import Agency from './Agency'

export default interface CourtCase {
  id: number
  caseSeq: number
  beginDate: string
  agency?: Agency
  caseType: string
  caseInfoNumber?: string
  caseStatus: string
  courtHearings?: CourtHearing[]
  court?: Court
}

export interface Court {
  agencyId: string
  description: string
  longDescription: string
  agencyType: string
  active: boolean
  courtType: string
}

export interface IssuingCourt {
  agencyId: string
  description: string
  longDescription: string
  agencyType: string
  active: boolean
  courtType: string
}
export interface CourtHearing {
  id: number
  dateTime: string
  location: {
    agencyId: string
    description: string
    longDescription: string
    agencyType: string
    active: boolean
    courtType: string
  }
}
