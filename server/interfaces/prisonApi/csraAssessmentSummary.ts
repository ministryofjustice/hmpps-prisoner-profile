export interface CsraAssessmentSummary {
  assessmentAgencyId?: string
  assessmentCode: string
  assessmentComment?: string
  assessmentDate: string
  assessmentSeq: number
  assessorUser?: string
  bookingId: number
  cellSharingAlertFlag: boolean
  classificationCode?: 'LOW' | 'MED' | 'STANDARD' | 'HI'
  nextReviewDate?: string
  offenderNo: string
}
