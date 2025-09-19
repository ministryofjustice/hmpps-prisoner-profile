import IncentivesService from '../../server/services/incentivesService'
import Interface from './Interface'

export const incentiveServiceMock = (): Interface<IncentivesService> => ({
  getIncentiveOverview: jest.fn(),
})

export default { incentiveServiceMock }
