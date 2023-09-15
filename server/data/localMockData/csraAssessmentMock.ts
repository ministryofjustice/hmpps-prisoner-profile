import { CsraAssessment } from '../../interfaces/prisonApi/csraAssessment'

const csraAssessmentMock: CsraAssessment = {
  bookingId: 111111,
  assessmentSeq: 4,
  offenderNo: 'A11111',
  classificationCode: 'STANDARD',
  assessmentCode: 'CSR',
  cellSharingAlertFlag: true,
  assessmentDate: '2017-01-12',
  assessmentAgencyId: 'HLI',
  assessmentComment: 'HiMEIesRHiMEIesR',
  assessorUser: 'BQN38E',
  nextReviewDate: '2018-01-13',
  assessmentCommitteeCode: 'RECP',
  assessmentCommitteeName: 'Reception',
  approvalDate: '2017-01-13',
  approvalCommitteeCode: 'REVIEW',
  approvalCommitteeName: 'Review Board',
  classificationReviewReason: 'Reason',
  questions: [
    {
      question: 'Select Risk Rating',
      answer: 'Standard',
      additionalAnswers: [],
    },
  ],
}

export default csraAssessmentMock
