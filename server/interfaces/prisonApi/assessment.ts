export interface Assessment {
  bookingId?: number
  offenderNo?: string
  classificationCode: string
  classification: string
  assessmentCode: string
  assessmentDescription: string
  cellSharingAlertFlag: boolean
  assessmentDate: string
  nextReviewDate: string
  approvalDate?: string
  assessmentAgencyId?: string
  assessmentStatus?: 'P' | 'A' | 'I'
  assessmentSeq?: number
  assessmentComment?: string
  assessorId?: number
  assessorUser?: string
}
