import { parseISO, startOfDay } from 'date-fns'
import toPersonalLearningPlanActionPlan from './personalLearningPlanActionPlanMapper'
import { aValidGetGoalsResponse } from '../../data/localMockData/getGoalsResponse'
import aValidGoalResponse from '../../data/localMockData/goalResponse'
import { PersonalLearningPlanActionPlan } from '../interfaces/educationAndWorkPlanApiPersonalLearningPlanService/PersonalLearningPlanGoals'

describe('personalLearningPlanActionPlanMapper', () => {
  it('should map GetGoalsResponse to a PersonalLearningPlanActionPlan', () => {
    // Given
    const apiGetGoalsResponse = aValidGetGoalsResponse({
      reference: 'a20912ab-4dae-4aa4-8bc5-32319da8fceb',
      prisonNumber: 'A1234BC',
      goals: [
        aValidGoalResponse({
          title: 'Learn French',
          reference: 'd38a6c41-13d1-1d05-13c2-24619966119b',
          status: 'COMPLETED',
          createdAt: '2023-01-16T09:14:43.158Z',
          createdBy: 'user_a',
          createdByDisplayName: 'User A',
          updatedAt: '2023-09-23T14:43:02.094Z',
          updatedBy: 'user_b',
          updatedByDisplayName: 'User B',
          targetCompletionDate: '2024-02-01',
        }),
        aValidGoalResponse({
          title: 'Learn basic carpentry',
          reference: '30b8abe1-736f-426d-87a7-0e1a7f2f63ab',
          status: 'ACTIVE',
          createdAt: '2023-03-20T10:24:03.651Z',
          createdBy: 'user_c',
          createdByDisplayName: 'User C',
          updatedAt: '2023-07-01T11:14:43.017Z',
          updatedBy: 'user_d',
          updatedByDisplayName: 'User D',
          targetCompletionDate: '2024-02-29',
        }),
        aValidGoalResponse({
          title: 'Learn advanced geometry',
          reference: '30b8abe1-736f-426d-87a7-0e1a7f2f63ab',
          status: 'ARCHIVED',
          createdAt: '2023-03-20T10:24:03.651Z',
          createdBy: 'user_c',
          createdByDisplayName: 'User C',
          updatedAt: '2023-07-01T11:14:43.017Z',
          updatedBy: 'user_d',
          updatedByDisplayName: 'User D',
          targetCompletionDate: '2024-02-29',
        }),
      ],
    })

    const expected: PersonalLearningPlanActionPlan = {
      prisonerNumber: 'A1234BC',
      completedGoals: [
        {
          reference: 'd38a6c41-13d1-1d05-13c2-24619966119b',
          title: 'Learn French',
          status: 'COMPLETED',
          createdAt: parseISO('2023-01-16T09:14:43.158Z'),
          createdBy: 'user_a',
          createdByDisplayName: 'User A',
          updatedAt: parseISO('2023-09-23T14:43:02.094Z'),
          updatedBy: 'user_b',
          updatedByDisplayName: 'User B',
          targetCompletionDate: startOfDay(parseISO('2024-02-01')),
        },
      ],
      activeGoals: [
        {
          reference: '30b8abe1-736f-426d-87a7-0e1a7f2f63ab',
          title: 'Learn basic carpentry',
          status: 'ACTIVE',
          createdAt: parseISO('2023-03-20T10:24:03.651Z'),
          createdBy: 'user_c',
          createdByDisplayName: 'User C',
          updatedAt: parseISO('2023-07-01T11:14:43.017Z'),
          updatedBy: 'user_d',
          updatedByDisplayName: 'User D',
          targetCompletionDate: startOfDay(parseISO('2024-02-29')),
        },
      ],
      archivedGoals: [
        {
          title: 'Learn advanced geometry',
          reference: '30b8abe1-736f-426d-87a7-0e1a7f2f63ab',
          status: 'ARCHIVED',
          createdAt: parseISO('2023-03-20T10:24:03.651Z'),
          createdBy: 'user_c',
          createdByDisplayName: 'User C',
          updatedAt: parseISO('2023-07-01T11:14:43.017Z'),
          updatedBy: 'user_d',
          updatedByDisplayName: 'User D',
          targetCompletionDate: startOfDay('2024-02-29'),
        },
      ],
      updatedAt: parseISO('2023-09-23T14:43:02.094Z'),
      updatedBy: 'user_b',
      updatedByDisplayName: 'User B',
      problemRetrievingData: false,
    }

    // When
    const actual = toPersonalLearningPlanActionPlan('A1234BC', apiGetGoalsResponse)

    // Then
    expect(actual).toEqual(expected)
  })

  it('should map to PersonalLearningPlanActionPlan given GetGoalsResponse with no goals', () => {
    // Given
    const apiGetGoalsResponse = aValidGetGoalsResponse({
      reference: 'a20912ab-4dae-4aa4-8bc5-32319da8fceb',
      prisonNumber: 'A1234BC',
      goals: [],
    })

    const expected: PersonalLearningPlanActionPlan = {
      prisonerNumber: 'A1234BC',
      activeGoals: [],
      archivedGoals: [],
      completedGoals: [],
      updatedAt: undefined,
      updatedBy: undefined,
      updatedByDisplayName: undefined,
      problemRetrievingData: false,
    }

    // When
    const actual = toPersonalLearningPlanActionPlan('A1234BC', apiGetGoalsResponse)

    // Then
    expect(actual).toEqual(expected)
  })
})
