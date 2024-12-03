import toCuriousGoals from './curiousGoalsMapper'

import CuriousGoals from '../interfaces/workAndSkillsPageService/CuriousGoals'
import LearnerGoals from '../../data/interfaces/curiousApi/LearnerGoals'

describe('curiousGoalsMapper', () => {
  it('should map to CuriousGoals given LearnerGoals', () => {
    // Given
    const learnerGoals: LearnerGoals = {
      prn: 'A1234BC',
      employmentGoals: ['An employment goal'],
      personalGoals: ['A personal goal'],
      shortTermGoals: ['A short term goal'],
      longTermGoals: ['A long term goal'],
    }

    const expected: CuriousGoals = {
      prisonerNumber: 'A1234BC',
      employmentGoals: [{ key: { text: 'An employment goal' }, value: { text: '' } }],
      personalGoals: [{ key: { text: 'A personal goal' }, value: { text: '' } }],
      shortTermGoals: [{ key: { text: 'A short term goal' }, value: { text: '' } }],
      longTermGoals: [{ key: { text: 'A long term goal' }, value: { text: '' } }],
    }
    // When
    const actual = toCuriousGoals(learnerGoals)

    // Then
    expect(actual).toEqual(expected)
  })
})
