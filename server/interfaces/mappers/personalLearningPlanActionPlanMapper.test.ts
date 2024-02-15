import toPersonalLearningPlanActionPlan from './personalLearningPlanActionPlanMapper'
import { aValidActionPlanResponse, aValidGoalResponse } from '../../data/localMockData/actionPlanResponse'
import { PersonalLearningPlanActionPlan } from '../personalLearningPlanGoals'

describe('personalLearningPlanActionPlanMapper', () => {
  it('should map ActionPlanResponse to a PersonalLearningPlanActionPlan', () => {
    // Given
    const apiActionPlanResponse = aValidActionPlanResponse({
      reference: 'a20912ab-4dae-4aa4-8bc5-32319da8fceb',
      prisonNumber: 'A1234BC',
      goals: [
        aValidGoalResponse({
          title: 'Learn French',
          reference: 'd38a6c41-13d1-1d05-13c2-24619966119b',
          createdAt: '2023-01-16T09:14:43.158Z',
          createdBy: 'user_a',
          createdByDisplayName: 'User A',
          updatedAt: '2023-09-23T14:43:02.094Z',
          updatedBy: 'user_b',
          updatedByDisplayName: 'User B',
        }),
        aValidGoalResponse({
          title: 'Learn basic carpentry',
          reference: '30b8abe1-736f-426d-87a7-0e1a7f2f63ab',
          createdAt: '2023-03-20T10:24:03.651Z',
          createdBy: 'user_c',
          createdByDisplayName: 'User C',
          updatedAt: '2023-07-01T11:14:43.017Z',
          updatedBy: 'user_d',
          updatedByDisplayName: 'User D',
        }),
      ],
    })

    const expected: PersonalLearningPlanActionPlan = {
      prisonerNumber: 'A1234BC',
      goals: [
        {
          reference: 'd38a6c41-13d1-1d05-13c2-24619966119b',
          title: 'Learn French',
          createdAt: new Date('2023-01-16T09:14:43.158Z'),
          createdBy: 'user_a',
          createdByDisplayName: 'User A',
          updatedAt: new Date('2023-09-23T14:43:02.094Z'),
          updatedBy: 'user_b',
          updatedByDisplayName: 'User B',
          sequenceNumber: 1,
        },
        {
          reference: '30b8abe1-736f-426d-87a7-0e1a7f2f63ab',
          title: 'Learn basic carpentry',
          createdAt: new Date('2023-03-20T10:24:03.651Z'),
          createdBy: 'user_c',
          createdByDisplayName: 'User C',
          updatedAt: new Date('2023-07-01T11:14:43.017Z'),
          updatedBy: 'user_d',
          updatedByDisplayName: 'User D',
          sequenceNumber: 2,
        },
      ],
      updatedAt: new Date('2023-09-23T14:43:02.094Z'),
      updatedBy: 'user_b',
      updatedByDisplayName: 'User B',
      problemRetrievingData: false,
    }

    // When
    const actual = toPersonalLearningPlanActionPlan(apiActionPlanResponse)

    // Then
    expect(actual).toEqual(expected)
  })

  it('should map to PersonalLearningPlanActionPlan given ActionPlanResponse with no goals', () => {
    // Given
    const apiActionPlanResponse = aValidActionPlanResponse({
      reference: 'a20912ab-4dae-4aa4-8bc5-32319da8fceb',
      prisonNumber: 'A1234BC',
      goals: [],
    })

    const expected: PersonalLearningPlanActionPlan = {
      prisonerNumber: 'A1234BC',
      goals: [],
      updatedAt: undefined,
      updatedBy: undefined,
      updatedByDisplayName: undefined,
      problemRetrievingData: false,
    }

    // When
    const actual = toPersonalLearningPlanActionPlan(apiActionPlanResponse)

    // Then
    expect(actual).toEqual(expected)
  })
})
