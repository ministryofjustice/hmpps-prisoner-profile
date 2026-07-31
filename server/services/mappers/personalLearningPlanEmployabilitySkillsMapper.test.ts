import { parseISO } from 'date-fns'
import toPersonalLearningPlanEmployabilitySkills from './personalLearningPlanEmployabilitySkillsMapper'
import aValidGetEmployabilitySkillsResponse from '../../data/localMockData/getEmployabilitySkillsResponse'
import aValidGetEmployabilitySkillResponses from '../../data/localMockData/getEmployabilitySkillResponses'
import { PersonalLearningPlanEmployabilitySkill } from '../interfaces/educationAndWorkPlanApiPersonalLearningPlanService/PersonalLearningPlanViewModels'

describe('personalLearningPlanEmployabilitySkillsMapper', () => {
  it('should map a GetEmployabilitySkillResponses to an array of PersonalLearningPlanEmployabilitySkill', () => {
    // Given
    const apiGetEmployabilitySkillResponses = aValidGetEmployabilitySkillResponses({
      employabilitySkills: [
        aValidGetEmployabilitySkillsResponse({
          employabilitySkillType: 'TEAMWORK',
          employabilitySkillRating: 'QUITE_CONFIDENT',
          evidence: 'Demonstrated in class',
          sessionType: 'EDUCATION_REVIEW',
          sessionTypeDescription: 'Maths class',
          createdBy: 'asmith_gen',
          createdByDisplayName: 'Alex Smith',
          createdAt: '2023-01-16T09:14:43.158Z',
          createdAtPrison: 'MDI',
          updatedBy: 'asmith_gen',
          updatedByDisplayName: 'Alex Smith',
          updatedAt: '2023-09-23T14:43:02.094Z',
          updatedAtPrison: 'MDI',
        }),
      ],
    })

    const expected = [
      {
        employabilitySkillType: 'TEAMWORK',
        employabilitySkillRating: 'QUITE_CONFIDENT',
        evidence: 'Demonstrated in class',
        sessionType: 'EDUCATION_REVIEW',
        sessionTypeDescription: 'Maths class',
        createdBy: 'asmith_gen',
        createdByDisplayName: 'Alex Smith',
        createdAt: parseISO('2023-01-16T09:14:43.158Z'),
        updatedBy: 'asmith_gen',
        updatedByDisplayName: 'Alex Smith',
        updatedAt: parseISO('2023-09-23T14:43:02.094Z'),
      },
    ]

    // When
    const actual = toPersonalLearningPlanEmployabilitySkills(apiGetEmployabilitySkillResponses)

    // Then
    expect(actual).toEqual(expected)
  })

  it('should map an empty GetEmployabilitySkillResponses to an array of PersonalLearningPlanEmployabilitySkill', () => {
    // Given
    const apiGetEmployabilitySkillResponses = aValidGetEmployabilitySkillResponses({
      employabilitySkills: [],
    })

    const expected = [] as Array<PersonalLearningPlanEmployabilitySkill>

    // When
    const actual = toPersonalLearningPlanEmployabilitySkills(apiGetEmployabilitySkillResponses)

    // Then
    expect(actual).toEqual(expected)
  })
})
