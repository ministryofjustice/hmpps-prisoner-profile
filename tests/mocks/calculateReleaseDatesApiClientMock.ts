import CalculateReleaseDatesApiClient from '../../server/data/interfaces/calculateReleaseDatesApi/calculateReleaseDatesApiClient'

export const calculateReleaseDatesApiClientMock = (): CalculateReleaseDatesApiClient => ({
  getLatestCalculation: jest.fn(),
})
