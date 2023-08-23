import { CuriousApiClient } from '../../server/data/interfaces/curiousApiClient'

// eslint-disable-next-line import/prefer-default-export
export const curiousApiClientMock = (): CuriousApiClient => ({
  getLearnerEmployabilitySkills: jest.fn(),
  getLearnerProfile: jest.fn(),
  getLearnerEducation: jest.fn(),
  getLearnerLatestAssessments: jest.fn(),
  getLearnerGoals: jest.fn(),
  getLearnerNeurodivergence: jest.fn(),
})
