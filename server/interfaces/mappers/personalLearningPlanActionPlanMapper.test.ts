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
          updatedAt: '2023-09-23T14:43:02.094Z',
        }),
        aValidGoalResponse({
          title: 'Learn basic carpentry',
          reference: '30b8abe1-736f-426d-87a7-0e1a7f2f63ab',
          createdAt: '2023-03-20T10:24:03.651Z',
          updatedAt: '2023-07-01T11:14:43.017Z',
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
          updatedAt: new Date('2023-09-23T14:43:02.094Z'),
        },
        {
          reference: '30b8abe1-736f-426d-87a7-0e1a7f2f63ab',
          title: 'Learn basic carpentry',
          createdAt: new Date('2023-03-20T10:24:03.651Z'),
          updatedAt: new Date('2023-07-01T11:14:43.017Z'),
        },
      ],
      problemRetrievingData: false,
    }

    // When
    const actual = toPersonalLearningPlanActionPlan(apiActionPlanResponse)

    // Then
    expect(actual).toEqual(expected)
  })
})
