import { PrisonPersonApiClient } from '../../server/data/interfaces/prisonPersonApi/prisonPersonApiClient'
import { distinguishingMarkMock } from '../../server/data/localMockData/distinguishingMarksMock'

export const prisonPersonApiClientMock = (): PrisonPersonApiClient => ({
  updateHealth: jest.fn(),
  getDistinguishingMarks: jest.fn().mockResolvedValue([distinguishingMarkMock]),
  getImage: jest.fn(),
  postDistinguishingMark: jest.fn(),
  patchDistinguishingMark: jest.fn(),
  postDistinguishingMarkPhoto: jest.fn(),
  getDistinguishingMark: jest.fn(),
})
