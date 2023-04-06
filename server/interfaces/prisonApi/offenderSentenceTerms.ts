export interface OffenderSentenceTerms {
  bookingId: number
  sentenceSequence: number
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
  caseId: string
  fineAmount?: number
  sentenceTermCode: string
  lineSeq: number
  sentenceStartDate: string
}

export interface SentenceTermUI {
  sentenceHeader: string
  sentenceTypeDescription: string
  summaryDetailRows: SummaryDetailRow[]
}

interface SummaryDetailRow {
  label: string
  value: string
}
