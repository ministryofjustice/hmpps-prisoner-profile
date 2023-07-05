import { Agency } from './agency'
import { Court, IssuingCourt } from './courtCase'
import { CourtHearing } from './courtHearing'
import { SentenceSummaryOffence } from './offenceHistoryDetail'
import { Licence } from './offenderSentenceTerms'

export interface SentenceSumaryTerm {
  bookNumber: string
  bookingId: number
  courtSentences: SentenceSummaryCourtCaseExtended[]
  licenceSentences: SentenceSummaryCourtSentence[]
  keyDates: {
    sentenceStartDate?: string
    effectiveSentenceEndDate?: string
    nonDtoReleaseDate?: string
    nonDtoReleaseDateType?: string
    confirmedReleaseDate?: string
    releaseDate?: string
    sentenceExpiryDate?: string
    conditionalReleaseDate?: string
    postRecallReleaseDate?: string
    licenceExpiryDate?: string
    paroleEligibilityDate?: string
    homeDetentionCurfewEligibilityDate?: string
  }
  sentenceAdjustments: SentenceAdjustments
}

export interface SentenceAdjustments {
  additionalDaysAwarded: number
  unlawfullyAtLarge: number
  lawfullyAtLarge: number
  restoredAdditionalDaysAwarded: number
  specialRemission: number
  recallSentenceRemand: number
  recallSentenceTaggedBail: number
  remand: number
  taggedBail: number
  unusedRemand: number
}

export interface SentenceSummaryCourtCaseExtended {
  court?: Court
  sentences?: SentenceSummaryCourtSentence[]
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

export interface SentenceSummary {
  prisonerNumber: string
  latestPrisonTerm: SentenceSumaryTerm
}

export interface SentenceSummaryCourtSentencesOverview {
  caseInfoNumber?: string
  id: number
  caseSeq: number
  beginDate: string
  court: {
    agencyId: string
    description: string
    longDescription: string
    agencyType: string
    active: boolean
    courtType: string
  }
  caseType: string
  caseStatus: string
  sentences: SentenceSummaryCourtSentence[]
  issuingCourt: {
    agencyId: string
    description: string
    longDescription: string
    agencyType: string
    active: boolean
    courtType: string
  }
  issuingCourtDate: string
}

export interface SentenceSummaryCourtSentence {
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
  terms: SentenceSummaryTermDetail[]
  fineAmount?: number
  sentenceHeader?: string
  sentenced?: boolean
  sentenceLength?: string
  concurrentConsecutive?: string
  fineAmountFormat?: string
  sentenceLicence?: string
}

export interface SentenceSummaryTermDetail {
  termSequence: number
  sentenceTermCode: string
  startDate: string
  days?: number
  weeks?: number
  months?: number
  years?: number
  lifeSentence: boolean
  licence?: Licence
  caseId?: string
  sentenceTypeDescription?: string
}
