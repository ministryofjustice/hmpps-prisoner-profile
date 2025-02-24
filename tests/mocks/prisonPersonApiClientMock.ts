import { PrisonPersonApiClient } from '../../server/data/interfaces/prisonPersonApi/prisonPersonApiClient'

export const prisonPersonApiClientMock = (): PrisonPersonApiClient => ({
  updateHealth: jest.fn(),
  getFieldHistory: jest.fn(),
})
