import { CourtDateResults } from './courtDateResults'
import { Court } from './prisonApi/courtCase'
import { CourtHearing } from './prisonApi/courtHearing'
import { OffenceHistoryDetail } from './prisonApi/offenceHistoryDetail'

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
