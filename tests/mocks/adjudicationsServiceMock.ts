import AdjudicationsService from '../../server/services/adjudicationsService'
import Interface from './Interface'

export const adjudicationsServiceMock = (): Interface<AdjudicationsService> => ({
  getAdjudicationsOverview: jest.fn(),
})

export default { adjudicationsServiceMock }
