export interface CsraAssessment {
  approvalCommitteeCode?: string
  approvalCommitteeName?: string
  approvalDate?: string
  assessmentAgencyId?: string
  assessmentCode: string
  assessmentComment?: string
  assessmentCommitteeCode?: string
  assessmentCommitteeName?: string
  assessmentDate: string
  assessmentSeq: number
  assessorUser?: string
  bookingId: number
  cellSharingAlertFlag: boolean
  classificationCode?: 'LOW' | 'MED' | 'STANDARD' | 'HI'
  classificationReviewReason?: string
  nextReviewDate?: string
  offenderNo: string
  originalClassificationCode?: 'LOW' | 'MED' | 'STANDARD' | 'HI'
  questions: [
    {
      question: string
      answer?: string
      additionalAnswers?: string[]
    },
  ]
}
