import { ChargeResultCode } from '../../enums/chargeCodes'

export default interface OffenceHistoryDetail {
  bookingId?: number
  offenceDate?: string
  offenceRangeDate?: string
  offenceDescription: string
  offenceCode: string
  statuteCode?: string
  mostSerious?: boolean
  primaryResultCode?: ChargeResultCode
  secondaryResultCode?: string
  primaryResultDescription?: string
  secondaryResultDescription?: string
  primaryResultConviction?: boolean
  secondaryResultConviction?: boolean
  courtDate?: string
  caseId?: number
}

export interface SentenceSummaryOffence extends OffenceHistoryDetail {
  offenderChargeId?: number
  offenceStartDate?: string
  offenceEndDate?: string
  indicators?: string[]
  offenceDescription: string
  offenceCode: string
}
