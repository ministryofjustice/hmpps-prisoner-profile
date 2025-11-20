import type { AllAssessmentDTO } from 'curiousApiClient'

export const LearnerAssessmentsMock: AllAssessmentDTO = {
  v1: [
    {
      prn: 'G6123VU',
      ldd: [
        {
          establishmentId: 'MDI',
          establishmentName: 'MOORLAND (HMP & YOI)',
          rapidAssessmentDate: '2022-02-18',
          inDepthAssessmentDate: null,
          lddPrimaryName: 'Visual impairment',
          lddSecondaryNames: ['Hearing impairment', 'Mental health difficulty', 'Social and emotional difficulties'],
        },
      ],
      qualifications: [
        {
          establishmentId: 'MDI',
          establishmentName: 'MOORLAND (HMP & YOI)',
          qualification: {
            qualificationType: 'Maths',
            qualificationGrade: 'Entry Level 1',
            assessmentDate: '2021-07-01',
          },
        },
        {
          establishmentId: 'MDI',
          establishmentName: 'MOORLAND (HMP & YOI)',
          qualification: {
            qualificationType: 'Digital Literacy',
            qualificationGrade: 'Entry Level 3',
            assessmentDate: '2021-07-01',
          },
        },
      ],
    },
  ],
  v2: {
    prn: 'G6123VU',
    assessments: {
      aln: [
        {
          establishmentId: 'MDI',
          establishmentName: 'MOORLAND (HMP & YOI)',
          assessmentDate: '2025-10-01',
          assessmentOutcome: 'Yes',
          hasPrisonerConsent: 'Yes',
          stakeholderReferral: 'Education Specialist',
        },
      ],
      englishFunctionalSkills: [
        {
          establishmentId: 'MDI',
          establishmentName: 'MOORLAND (HMP & YOI)',
          assessmentDate: '2025-10-01',
          workingTowardsLevel: 'Entry Level 1',
          levelBanding: '1.5',
          assessmentNextStep: 'Progress to higher level based on evidence of prior attainment',
          stakeholderReferral: 'Education Specialist',
          hasPrisonerConsent: true,
        },
        {
          establishmentId: 'MDI',
          establishmentName: 'MOORLAND (HMP & YOI)',
          assessmentDate: '2025-10-09',
          workingTowardsLevel: 'Entry Level 2',
          levelBanding: '2.4',
          assessmentNextStep: 'Progress to course at level consistent with assessment result',
          stakeholderReferral: 'Education Specialist',
          hasPrisonerConsent: true,
        },
      ],
      mathsFunctionalSkills: [],
      digitalSkillsFunctionalSkills: [],
      reading: [],
      esol: [
        {
          establishmentId: 'MDI',
          establishmentName: 'MOORLAND (HMP & YOI)',
          assessmentDate: '2025-10-05',
          assessmentOutcome: 'ESOL Pathway',
          assessmentNextStep: 'English Language Support Level 2',
          stakeholderReferral: 'NSM',
          hasPrisonerConsent: true,
        },
      ],
    },
  },
}

export default {
  LearnerAssessmentsMock,
}
