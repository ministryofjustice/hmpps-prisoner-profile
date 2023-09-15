export interface CsraAssessment {
  bookingId: number
  assessmentSeq: number
  offenderNo: string
  classificationCode?: string
  assessmentCode?: string
  cellSharingAlertFlag: boolean
  assessmentDate: string
  assessmentAgencyId?: string
  assessmentComment?: string
  assessorUser?: string
  nextReviewDate?: string
  assessmentCommitteeCode?: string
  assessmentCommitteeName?: string
  approvalDate?: string
  approvalCommitteeCode?: string
  approvalCommitteeName?: string
  originalClassificationCode?: string
  classificationReviewReason?: string
  questions: [
    {
      question: string
      answer?: string
      additionalAnswers?: string[]
    },
  ]
}
