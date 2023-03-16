import { AssessmentQualificationType } from '../data/enums/dpsCore'

export interface LearnerLatestAssessment {
  prn: string
  qualifications: LearnerQualifications[]
}

interface LearnerQualifications {
  establishmentId: string
  establishmentName: string
  qualification: {
    qualificationType: AssessmentQualificationType
    qualificationGrade: string
    assessmentDate: string
  }
}
