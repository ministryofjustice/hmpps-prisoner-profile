export interface AdjudicationSummary {
  bookingId: number
  adjudicationCount: number
  awards: AdjudicationSummaryAward[]
}

export interface AdjudicationSummaryAward {
  bookingId: number
  sanctionCode: string
  sanctionCodeDescription: string
  months?: number
  days: number
  limit?: number
  comment: string
  effectiveDate: string
  status: string
  statusDescription: string
  hearingId: number
  hearingSequence: number
}
