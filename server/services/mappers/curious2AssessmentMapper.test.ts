import { startOfDay } from 'date-fns'
import type { ExternalAssessmentsDTO } from 'curiousApiClient'
import {
  toCurious2ESOLAssessments,
  toCurious2FunctionalSkillsAssessments,
  toCurious2ReadingAssessments,
} from './curious2AssessmentMapper'
import { Assessment } from '../interfaces/curiousService/CuriousFunctionalSkillsAssessments'

describe('curious2AssessmentMapper', () => {
  const externalAssessments = {
    englishFunctionalSkills: [
      {
        establishmentId: 'LEI',
        assessmentDate: '2024-12-13',
        workingTowardsLevel: 'Pre-Entry',
        levelBanding: '0.3',
        assessmentNextStep: 'Progress to course at level consistent with assessment result',
        stakeholderReferral: 'Education Specialist',
      },
      {
        establishmentId: 'LPI',
        assessmentDate: '2025-10-20',
        workingTowardsLevel: 'Level 1',
        levelBanding: '1.4',
        assessmentNextStep: 'Progress to higher level based on evidence of prior attainment',
        stakeholderReferral: 'NSM',
      },
    ],
    mathsFunctionalSkills: [
      {
        establishmentId: 'CYI',
        assessmentDate: '2025-06-15',
        workingTowardsLevel: 'Level 3',
        levelBanding: '3.3',
        assessmentNextStep: 'Progress to higher level based on evidence of prior attainment',
        stakeholderReferral: 'Psychology, NSM, Other',
      },
    ],
    digitalSkillsFunctionalSkills: [
      {
        establishmentId: 'GPI',
        assessmentDate: '2025-05-22',
        workingTowardsLevel: 'Entry Level',
        levelBanding: '0.6',
      },
      {
        establishmentId: 'FEI',
        assessmentDate: '2025-07-01',
        workingTowardsLevel: 'Level 1',
        levelBanding: '1.2',
      },
    ],
    reading: [
      {
        establishmentId: 'LEI',
        assessmentDate: '2024-12-13',
        assessmentOutcome: 'non-reader',
        assessmentNextStep: 'Refer for reading support level.',
        stakeholderReferral: 'Education Specialist',
      },
      {
        establishmentId: 'SKI',
        assessmentDate: '2025-09-01',
        assessmentOutcome: 'emerging reader',
        assessmentNextStep: 'Reading support not required at this time.',
        stakeholderReferral: 'Other',
      },
    ],
    esol: [
      {
        establishmentId: 'BXI',
        assessmentDate: '2025-10-01',
        assessmentOutcome: 'ESOL Pathway',
        assessmentNextStep: 'English Language Support Level 1',
        stakeholderReferral: 'Education Specialist',
      },
      {
        establishmentId: 'MDI',
        assessmentDate: '2025-10-15',
        assessmentOutcome: 'ESOL Pathway',
        assessmentNextStep: 'English Language Support Level 2',
        stakeholderReferral: 'Substance Misuse Team',
      },
    ],
  }

  describe('toCurious2FunctionalSkillsAssessments', () => {
    it('should map Functional Skills assessments', () => {
      const externalAssessmentsDTO = {
        ...externalAssessments,
      }

      const expected: Array<Assessment> = [
        {
          prisonId: 'LEI',
          type: 'ENGLISH',
          assessmentDate: startOfDay('2024-12-13'),
          level: 'Pre-Entry',
          levelBanding: '0.3',
          nextStep: 'Progress to course at level consistent with assessment result',
          referral: ['Education Specialist'],
          source: 'CURIOUS2',
        },
        {
          prisonId: 'LPI',
          type: 'ENGLISH',
          assessmentDate: startOfDay('2025-10-20'),
          level: 'Level 1',
          levelBanding: '1.4',
          nextStep: 'Progress to higher level based on evidence of prior attainment',
          referral: ['NSM'],
          source: 'CURIOUS2',
        },
        {
          prisonId: 'CYI',
          type: 'MATHS',
          assessmentDate: startOfDay('2025-06-15'),
          level: 'Level 3',
          levelBanding: '3.3',
          nextStep: 'Progress to higher level based on evidence of prior attainment',
          referral: ['Psychology', 'NSM', 'Other'],
          source: 'CURIOUS2',
        },
        {
          prisonId: 'GPI',
          type: 'DIGITAL_LITERACY',
          assessmentDate: startOfDay('2025-05-22'),
          level: 'Entry Level',
          levelBanding: '0.6',
          nextStep: undefined,
          referral: null,
          source: 'CURIOUS2',
        },
        {
          prisonId: 'FEI',
          type: 'DIGITAL_LITERACY',
          assessmentDate: startOfDay('2025-07-01'),
          level: 'Level 1',
          levelBanding: '1.2',
          nextStep: undefined,
          referral: null,
          source: 'CURIOUS2',
        },
      ]

      // When
      const actual = toCurious2FunctionalSkillsAssessments(externalAssessmentsDTO)

      // Then
      expect(actual).toEqual(expected)
    })

    it('should map Functional Skills assessments given null ExternalAssessmentsDTO', () => {
      // Given
      const externalAssessmentsDTO: ExternalAssessmentsDTO = null

      const expected: Array<Assessment> = []

      // When
      const actual = toCurious2FunctionalSkillsAssessments(externalAssessmentsDTO)

      // Then
      expect(actual).toEqual(expected)
    })

    it('should map Functional Skills assessments given functional skills arrays are all null within ExternalAssessmentsDTO', () => {
      // Given
      const externalAssessmentsDTO: ExternalAssessmentsDTO = {
        ...externalAssessments,
        englishFunctionalSkills: null,
        mathsFunctionalSkills: null,
        digitalSkillsFunctionalSkills: null,
      }

      const expected: Array<Assessment> = []

      // When
      const actual = toCurious2FunctionalSkillsAssessments(externalAssessmentsDTO)

      // Then
      expect(actual).toEqual(expected)
    })

    it('should map Functional Skills assessments given functional skills arrays are all empty arrays within ExternalAssessmentsDTO', () => {
      // Given
      const externalAssessmentsDTO: ExternalAssessmentsDTO = {
        ...externalAssessments,
        englishFunctionalSkills: [],
        mathsFunctionalSkills: [],
        digitalSkillsFunctionalSkills: [],
      }

      const expected: Array<Assessment> = []

      // When
      const actual = toCurious2FunctionalSkillsAssessments(externalAssessmentsDTO)

      // Then
      expect(actual).toEqual(expected)
    })
  })

  describe('toCurious2ReadingAssessments', () => {
    it('should map ESOL assessments', () => {
      // Given
      const externalAssessmentsDTO = {
        ...externalAssessments,
      }

      const expected: Array<Assessment> = [
        {
          prisonId: 'LEI',
          type: 'READING',
          assessmentDate: startOfDay('2024-12-13'),
          level: 'non-reader',
          levelBanding: null,
          nextStep: 'Refer for reading support level.',
          referral: ['Education Specialist'],
          source: 'CURIOUS2',
        },
        {
          prisonId: 'SKI',
          type: 'READING',
          assessmentDate: startOfDay('2025-09-01'),
          level: 'emerging reader',
          levelBanding: null,
          nextStep: 'Reading support not required at this time.',
          referral: ['Other'],
          source: 'CURIOUS2',
        },
      ]

      // When
      const actual = toCurious2ReadingAssessments(externalAssessmentsDTO)

      // Then
      expect(actual).toEqual(expected)
    })

    it('should map ESOL assessments given null ExternalAssessmentsDTO', () => {
      // Given
      const externalAssessmentsDTO: ExternalAssessmentsDTO = null

      const expected: Array<Assessment> = []

      // When
      const actual = toCurious2ReadingAssessments(externalAssessmentsDTO)

      // Then
      expect(actual).toEqual(expected)
    })

    it('should map ESOL assessments given Reading array in ExternalAssessmentsDTO is null', () => {
      // Given
      const externalAssessmentsDTO: ExternalAssessmentsDTO = {
        ...externalAssessments,
        reading: null,
      }

      const expected: Array<Assessment> = []

      // When
      const actual = toCurious2ReadingAssessments(externalAssessmentsDTO)

      // Then
      expect(actual).toEqual(expected)
    })

    it('should map Reading assessments given Reading array in ExternalAssessmentsDTO is empty array', () => {
      // Given
      const externalAssessmentsDTO: ExternalAssessmentsDTO = {
        ...externalAssessments,
        reading: [],
      }

      const expected: Array<Assessment> = []

      // When
      const actual = toCurious2ReadingAssessments(externalAssessmentsDTO)

      // Then
      expect(actual).toEqual(expected)
    })
  })

  describe('toCurious2ESOLAssessments', () => {
    it('should map ESOL assessments', () => {
      // Given
      const externalAssessmentsDTO = {
        ...externalAssessments,
      }

      const expected: Array<Assessment> = [
        {
          prisonId: 'BXI',
          type: 'ESOL',
          assessmentDate: startOfDay('2025-10-01'),
          level: 'ESOL Pathway',
          levelBanding: null,
          nextStep: 'English Language Support Level 1',
          referral: ['Education Specialist'],
          source: 'CURIOUS2',
        },
        {
          prisonId: 'MDI',
          type: 'ESOL',
          assessmentDate: startOfDay('2025-10-15'),
          level: 'ESOL Pathway',
          levelBanding: null,
          nextStep: 'English Language Support Level 2',
          referral: ['Substance Misuse Team'],
          source: 'CURIOUS2',
        },
      ]

      // When
      const actual = toCurious2ESOLAssessments(externalAssessmentsDTO)

      // Then
      expect(actual).toEqual(expected)
    })

    it('should map ESOL assessments given null ExternalAssessmentsDTO', () => {
      // Given
      const externalAssessmentsDTO: ExternalAssessmentsDTO = null

      const expected: Array<Assessment> = []

      // When
      const actual = toCurious2ESOLAssessments(externalAssessmentsDTO)

      // Then
      expect(actual).toEqual(expected)
    })

    it('should map ESOL assessments given ESOL array in ExternalAssessmentsDTO is null', () => {
      // Given
      const externalAssessmentsDTO: ExternalAssessmentsDTO = {
        ...externalAssessments,
        esol: null,
      }

      const expected: Array<Assessment> = []

      // When
      const actual = toCurious2ESOLAssessments(externalAssessmentsDTO)

      // Then
      expect(actual).toEqual(expected)
    })

    it('should map ESOL assessments given ESOL array in ExternalAssessmentsDTO is empty array', () => {
      // Given
      const externalAssessmentsDTO: ExternalAssessmentsDTO = {
        ...externalAssessments,
        esol: [],
      }

      const expected: Array<Assessment> = []

      // When
      const actual = toCurious2ESOLAssessments(externalAssessmentsDTO)

      // Then
      expect(actual).toEqual(expected)
    })
  })
})
