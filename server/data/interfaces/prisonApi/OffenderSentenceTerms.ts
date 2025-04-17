import { SummaryListRow } from '../../../utils/utils'

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
  summaryListRow?: SummaryListRow[]
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
