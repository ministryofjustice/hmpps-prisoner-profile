import { PathfinderApiClient } from '../../server/data/interfaces/pathfinderApi/pathfinderApiClient'

export const pathfinderApiClientMock = (): PathfinderApiClient => ({
  getNominal: jest.fn(),
})
