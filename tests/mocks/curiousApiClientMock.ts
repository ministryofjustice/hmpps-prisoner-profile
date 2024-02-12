import { CuriousApiClient } from '../../server/data/interfaces/curiousApiClient'

export const curiousApiClientMock = (): CuriousApiClient => ({
  getLearnerEmployabilitySkills: jest.fn(),
  getLearnerProfile: jest.fn(),
  getLearnerEducation: jest.fn(),
  getLearnerLatestAssessments: jest.fn(),
  getLearnerGoals: jest.fn(),
  getLearnerNeurodivergence: jest.fn(),
})
