export interface CsipReferenceData {
  code: string
  description?: string
  listSequence?: number
  deactivatedAt?: string
}

export interface CurrentCsip {
  status: CsipReferenceData
  referralDate?: string
  nextReviewDate?: string
  closedDate?: string
  reviewOverdueDays?: number
}

export default interface CurrentCsipDetail {
  currentCsip?: CurrentCsip
  totalOpenedCsipCount: number
  totalReferralCount: number
}
