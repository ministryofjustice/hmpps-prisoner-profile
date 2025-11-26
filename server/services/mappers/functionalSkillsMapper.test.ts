import { parseISO, startOfDay } from 'date-fns'
import type { AllAssessmentDTO } from 'curiousApiClient'
import toFunctionalSkills from './functionalSkillsMapper'

describe('functionalSkillsMapper', () => {
  it('should map to functional skills given assessments containing v1 functional skills assessments and v2 assessments', () => {
    // Given
    const prisonNumber = 'G6123VU'
    const allAssessments: AllAssessmentDTO = {
      v1: [
        {
          prisonNumber,
          qualifications: [
            {
              establishmentId: 'MDI',
              qualification: {
                qualificationType: 'English',
                qualificationGrade: 'Level 1',
                assessmentDate: '2012-02-16',
              },
            },
          ],
        },
      ],
      v2: {
        assessments: {
          englishFunctionalSkills: [
            {
              establishmentId: 'MDI',
              assessmentDate: '2025-10-01',
              workingTowardsLevel: 'Entry Level 2',
              levelBanding: '2.1',
              assessmentNextStep: 'Progress to course at level consistent with assessment result',
              stakeholderReferral: 'Education Specialist',
            },
          ],
          mathsFunctionalSkills: [
            {
              establishmentId: 'MDI',
              assessmentDate: '2025-10-01',
              workingTowardsLevel: 'Level 2',
              levelBanding: '2.1',
              assessmentNextStep: 'Progress to course at level consistent with assessment result',
              stakeholderReferral: 'Education Specialist',
            },
          ],
          digitalSkillsFunctionalSkills: [
            {
              establishmentId: 'MDI',
              assessmentDate: '2025-10-01',
              workingTowardsLevel: 'Level 1',
              levelBanding: '1.2',
              assessmentNextStep: null,
              hasPrisonerConsent: null,
              stakeholderReferral: null,
            },
          ],
          reading: [
            {
              establishmentId: 'MDI',
              assessmentDate: '2025-10-01',
              assessmentOutcome: 'non-reader',
              assessmentNextStep: 'Refer for reading support level.',
              stakeholderReferral: 'Education Specialist',
            },
          ],
          esol: [
            {
              establishmentId: 'MDI',
              assessmentDate: '2025-10-01',
              assessmentOutcome: 'ESOL Pathway',
              assessmentNextStep: 'English Language Support Level 2',
              stakeholderReferral: 'Substance Misuse Team',
            },
          ],
        },
      },
    }

    const expected = {
      assessments: [
        {
          assessmentDate: startOfDay(parseISO('2025-10-01')),
          prisonId: 'MDI',
          type: 'ENGLISH',
          level: 'Entry Level 2',
          levelBanding: '2.1',
          nextStep: 'Progress to course at level consistent with assessment result',
          referral: 'Education Specialist',
          source: 'CURIOUS2',
        },
        {
          assessmentDate: startOfDay(parseISO('2025-10-01')),
          prisonId: 'MDI',
          type: 'MATHS',
          level: 'Level 2',
          levelBanding: '2.1',
          nextStep: 'Progress to course at level consistent with assessment result',
          referral: 'Education Specialist',
          source: 'CURIOUS2',
        },
        {
          assessmentDate: startOfDay(parseISO('2025-10-01')),
          prisonId: 'MDI',
          type: 'DIGITAL_LITERACY',
          level: 'Level 1',
          levelBanding: '1.2',
          nextStep: null,
          referral: null,
          source: 'CURIOUS2',
        },
        {
          assessmentDate: startOfDay(parseISO('2025-10-01')),
          prisonId: 'MDI',
          type: 'READING',
          level: 'non-reader',
          levelBanding: null,
          nextStep: 'Refer for reading support level.',
          referral: 'Education Specialist',
          source: 'CURIOUS2',
        },
        {
          assessmentDate: startOfDay(parseISO('2025-10-01')),
          prisonId: 'MDI',
          type: 'ESOL',
          level: 'ESOL Pathway',
          levelBanding: null,
          nextStep: 'English Language Support Level 2',
          referral: 'Substance Misuse Team',
          source: 'CURIOUS2',
        },
        {
          assessmentDate: startOfDay(parseISO('2012-02-16')),
          prisonId: 'MDI',
          type: 'ENGLISH',
          level: 'Level 1',
          levelBanding: null,
          nextStep: null,
          referral: null,
          source: 'CURIOUS1',
        },
      ],
    }

    // When
    const actual = toFunctionalSkills(allAssessments)

    // Then
    expect(actual).toEqual(expected)
  })
})
