import { startOfDay } from 'date-fns'
import type { LearnerAssessmentV1DTO, LearnerLatestAssessmentV1DTO } from 'curiousApiClient'
import toCurious1AssessmentsFromAllAssessmentDTO from './curious1AssessmentMapper'
import { Assessment } from '../interfaces/curiousService/CuriousFunctionalSkillsAssessments'

describe('curious1AssessmentMapper', () => {
  describe('toCurious1AssessmentsFromAllAssessmentDTO', () => {
    it('should map to Assessments given AllAssessmentDTO contains v1 assessments', () => {
      // Given
      const prisonNumber = 'G6123VU'
      const curiousV1Assessments = [
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
            {
              establishmentId: 'MDI',
              qualification: {
                qualificationType: 'Maths',
                qualificationGrade: 'Level 2',
                assessmentDate: '2012-02-18',
              },
            },
          ],
        },
        {
          prisonNumber,
          qualifications: [
            {
              establishmentId: 'DNI',
              qualification: {
                qualificationType: 'Digital Literacy',
                qualificationGrade: 'Level 3',
                assessmentDate: '2022-08-29',
              },
            },
          ],
        },
      ]

      const expected = [
        {
          assessmentDate: startOfDay('2012-02-16'),
          level: 'Level 1',
          prisonId: 'MDI',
          type: 'ENGLISH',
          levelBanding: null as string,
          nextStep: null as string,
          referral: null as string,
          source: 'CURIOUS1',
        },
        {
          assessmentDate: startOfDay('2012-02-18'),
          level: 'Level 2',
          prisonId: 'MDI',
          type: 'MATHS',
          levelBanding: null as string,
          nextStep: null as string,
          referral: null as string,
          source: 'CURIOUS1',
        },
        {
          assessmentDate: startOfDay('2022-08-29'),
          level: 'Level 3',
          prisonId: 'DNI',
          type: 'DIGITAL_LITERACY',
          levelBanding: null as string,
          nextStep: null as string,
          referral: null as string,
          source: 'CURIOUS1',
        },
      ]

      // When
      const actual = toCurious1AssessmentsFromAllAssessmentDTO(curiousV1Assessments)

      // Then
      expect(actual).toEqual(expected)
    })

    it('should map to Assessments given no v1 assessments', () => {
      // Given
      const curiousV1Assessments = null as Array<LearnerLatestAssessmentV1DTO>

      const expected = [] as Array<Assessment>

      // When
      const actual = toCurious1AssessmentsFromAllAssessmentDTO(curiousV1Assessments)

      // Then
      expect(actual).toEqual(expected)
    })

    it('should map to Assessments given no v1 assessment qualifications', () => {
      // Given
      const curiousV1Assessments = [
        {
          qualifications: null as Array<LearnerAssessmentV1DTO>,
        },
      ]

      const expected = [] as Array<Assessment>

      // When
      const actual = toCurious1AssessmentsFromAllAssessmentDTO(curiousV1Assessments)

      // Then
      expect(actual).toEqual(expected)
    })
  })
})
