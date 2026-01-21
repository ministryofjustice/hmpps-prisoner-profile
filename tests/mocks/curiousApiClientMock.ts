import CuriousApiClient from '../../server/data/interfaces/curiousApi/curiousApiClient'

export const curiousApiClientMock = (): CuriousApiClient => ({
  getLearnerEmployabilitySkills: jest.fn(),
  getLearnerGoals: jest.fn(),
  getLearnerNeurodivergence: jest.fn(),
  getLearnerAssessments: jest.fn(),
  getLearnerQualifications: jest.fn(),
})

export default { curiousApiClientMock }
