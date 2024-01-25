export type ClassificationCode = 'LOW' | 'MED' | 'STANDARD' | 'HI'
export interface CsraAssessment {
  approvalComment?: string
  approvalCommitteeCode?: string
  approvalCommitteeName?: string
  approvalDate?: string
  approvedClassificationCode?: ClassificationCode
  assessmentAgencyId?: string
  assessmentCode: string
  assessmentComment?: string
  assessmentCommitteeCode?: string
  assessmentCommitteeName?: string
  assessmentDate: string
  assessmentSeq: number
  assessorUser?: string
  bookingId: number
  calculatedClassificationCode?: ClassificationCode
  cellSharingAlertFlag: boolean
  classificationCode?: ClassificationCode
  classificationReviewReason?: string
  nextReviewDate?: string
  offenderNo: string
  originalClassificationCode?: ClassificationCode
  overrideReason?: string
  overridingClassificationCode?: ClassificationCode
  questions: [
    {
      question: string
      answer?: string
      additionalAnswers?: string[]
    },
  ]
}
