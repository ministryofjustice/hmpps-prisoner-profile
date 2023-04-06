import { Agency } from "./agency"
import { CourtHearing } from "./courtHearing"

export interface CourtCase {
  id: number
  caseSeq: number
  beginDate: string
  agency: Agency
  caseType: string
  caseInfoNumber: string
  caseStatus: string
  courtHearings: CourtHearing[]
}