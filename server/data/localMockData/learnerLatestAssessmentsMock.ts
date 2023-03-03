import { LearnerLatestAssessment } from '../../interfaces/learnerLatestAssessments'
import { AssessmentQualificationType } from '../enums/dpsCore'

export const LearnerLatestAssessmentsMock: LearnerLatestAssessment[] = [
  {
    prn: 'G6123VU',
    qualifications: [
      {
        establishmentId: 'string',
        establishmentName: 'string',
        qualification: {
          qualificationType: AssessmentQualificationType.English,
          qualificationGrade: 'string',
          assessmentDate: '2023-03-01',
        },
      },
      {
        establishmentId: 'string',
        establishmentName: 'string',
        qualification: {
          qualificationType: AssessmentQualificationType.Maths,
          qualificationGrade: 'string',
          assessmentDate: '2023-03-01',
        },
      },
    ],
  },
]

export default {
  LearnerLatestAssessmentsMock,
}
