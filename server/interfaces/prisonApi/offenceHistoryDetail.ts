export interface OffenceHistoryDetail {
  bookingId: number
  offenceDate?: string
  offenceRangeDate?: string
  offenceDescription: string
  offenceCode: string
  statuteCode: string
  mostSerious: boolean
  primaryResultCode?: string
  secondaryResultCode?: string
  primaryResultDescription?: string
  secondaryResultDescription?: string
  primaryResultConviction?: boolean
  secondaryResultConviction?: boolean
  courtDate?: string
  caseId?: number
}
