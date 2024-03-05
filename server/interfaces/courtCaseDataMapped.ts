import CourtDateResults from '../data/interfaces/prisonApi/CourtDateResults'
import { Court, CourtHearing } from '../data/interfaces/prisonApi/CourtCase'
import OffenceHistoryDetail from '../data/interfaces/prisonApi/OffenceHistoryDetail'

export interface CourtCaseDataMapped {
  sentenced: boolean
  nextCourtAppearance: CourtHearing
  courtHearings: CourtHearing[]
  caseInfoNumber: string
  courtName: string
  sentenceTerms: CourtCaseSentenceTerm[]
  beginDate?: string
  caseSeq?: number
  caseStatus: string
  caseType: string
  court: Court
  id?: number
  issuingCourt: Court
  issuingCourtDate?: string
}

export interface CourtCaseDataMappedUnsentenced {
  sentenced: boolean
  nextCourtAppearance: CourtHearing
  courtHearings: CourtHearing[]
  caseInfoNumber: string
  courtName: string
  sentenceHeader: string
  courtDateResults: CourtDateResults[]
  id?: number
}

export interface CourtCaseSentenceTerm {
  sentenceHeader: string
  sentenceTypeDescription: string
  summaryDetailRows: object[]
  offences: OffenceHistoryDetail[]
}
