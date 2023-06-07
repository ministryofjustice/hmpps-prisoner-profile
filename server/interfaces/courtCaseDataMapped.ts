import { CourtDateResults } from './courtDateResults'
import { CourtHearing } from './prisonApi/courtHearing'
import { OffenceHistoryDetail } from './prisonApi/offenceHistoryDetail'

export interface CourtCaseDataMapped {
  sentenced: boolean
  nextCourtAppearance: CourtHearing
  courtHearings: CourtHearing[]
  caseInfoNumber: string
  courtName: string
  sentenceTerms: CourtCaseSentenceTerm[]
}

export interface CourtCaseDataMappedUnsentenced {
  sentenced: boolean
  nextCourtAppearance: CourtHearing
  courtHearings: CourtHearing[]
  caseInfoNumber: string
  courtName: string
  sentenceHeader: string
  courtDateResults: CourtDateResults[]
}

export interface CourtCaseSentenceTerm {
  sentenceHeader: string
  sentenceTypeDescription: string
  summaryDetailRows: object[]
  offences: OffenceHistoryDetail[]
}
