export default interface ReasonableAdjustment {
  personalCareNeedId: number
  treatmentCode?: string
  commentText?: string
  startDate?: string
  endDate?: string
  agencyId?: string
  agencyDescription?: string
  treatmentDescription?: string
}

export interface ReasonableAdjustments {
  reasonableAdjustments: ReasonableAdjustment[]
}
