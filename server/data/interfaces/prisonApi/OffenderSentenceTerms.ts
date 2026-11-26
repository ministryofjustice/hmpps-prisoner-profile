import type { GovukSummaryListRow } from '../../../interfaces/govukComponents'

export default interface OffenderSentenceTerms {
  bookingId?: number
  sentenceSequence?: number
  termSequence: number
  consecutiveTo?: number
  sentenceType?: string
  sentenceTypeDescription?: string
  startDate: string
  years?: number
  months?: number
  weeks?: number
  days?: number
  lifeSentence: boolean
  caseId?: string
  fineAmount?: number
  sentenceTermCode: string
  lineSeq?: number
  sentenceStartDate?: string
  licence?: Licence
  summaryListRow?: GovukSummaryListRow[]
}

export interface Licence {
  years: number
  months: number
  weeks: number
  days: number
}

export interface FindConsecutiveSentence {
  sentences: OffenderSentenceTerms[]
  consecutiveTo: string | number
}
