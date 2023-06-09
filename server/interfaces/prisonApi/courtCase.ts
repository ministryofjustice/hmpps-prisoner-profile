import { Agency } from './agency'
import { CourtHearing } from './courtHearing'
import { SentenceSummaryOffence } from './offenceHistoryDetail'
import { Licence } from './offenderSentenceTerms'

export interface CourtCase {
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

export interface CourtCaseExtended extends CourtCase {
  sentences?: CourtCaseSentenceSummaryCourtSentence[]
  issuingCourt?: IssuingCourt
  issuingCourtDate: string
}

export interface CourtCaseSentenceSummaryCourtSentence {
  sentenceSequence: number
  sentenceStatus: string
  sentenceCategory: string
  sentenceCalculationType: string
  sentenceTypeDescription: string
  sentenceStartDate: string
  sentenceEndDate: string
  consecutiveToSequence?: number
  consecutiveTo?: number
  lineSeq?: number
  offences: SentenceSummaryOffence[]
  terms: CourtCaseSentenceSummaryTermDetail[]
  fineAmount?: number
  licence?: Licence
}

export interface CourtCaseSentenceSummaryTermDetail {
  termSequence: number
  sentenceTermCode: string
  startDate: string
  days?: number
  weeks?: number
  months?: number
  years?: number
  lifeSentence: boolean
}

export interface CourtCaseSentenceSummaryCourtCaseExtended {
  court?: Court
  sentences?: CourtCaseSentenceSummaryCourtSentence[]
  issuingCourt?: IssuingCourt
  issuingCourtDate: string
  id: number
  caseSeq: number
  beginDate: string
  agency?: Agency
  caseType: string
  caseInfoNumber?: string
  caseStatus: string
  courtHearings?: CourtHearing[]
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
