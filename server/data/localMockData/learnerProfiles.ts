import { LearnerProfile } from "../../interfaces/learnerProfile";
import { AssessmentQualificationType } from "../enums/dpsCore";

export const LearnerProfiles: LearnerProfile[] = [
    {
      prn: 'G6123VU',
      establishmentId: 'MDI',
      establishmentName: 'MOORLAND (HMP & YOI)',
      uln: '1234123412',
      lddHealthProblem:
        'Learner considers himself or herself to have a learning difficulty and/or disability and/or health problem.',
      priorAttainment: 'Full level 3',
      qualifications: [
        {
          qualificationType: AssessmentQualificationType.English,
          qualificationGrade: 'Level 1',
          assessmentDate: '2021-05-13',
        }
      ],
      languageStatus: 'English',
      plannedHours: 200,
      rapidAssessmentDate: null,
      inDepthAssessmentDate: null,
      primaryLDDAndHealthProblem: 'Visual impairment',
      additionalLDDAndHealthProblems: [
        'Hearing impairment',
        'Social and emotional difficulties',
        'Mental health difficulty',
      ],
    },
    {
      prn: 'G6123VU',
      establishmentId: 'WDI',
      establishmentName: 'WAKEFIELD (HMP)',
      uln: '9876987654',
      lddHealthProblem: null,
      priorAttainment: null,
      qualifications: [
        {
          qualificationType: AssessmentQualificationType.English,
          qualificationGrade: 'Entry Level 1',
          assessmentDate: '2019-03-01',
        }
      ],
      languageStatus: 'English',
      plannedHours: null,
      rapidAssessmentDate: null,
      inDepthAssessmentDate: null,
      primaryLDDAndHealthProblem: null,
      additionalLDDAndHealthProblems: [],
    },
  ]

export default {
    LearnerProfiles
}