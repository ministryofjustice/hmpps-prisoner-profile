import OverviewPageService from '../../server/services/overviewPageService'
import Interface from './Interface'

export const overviewPageServiceMock = (): Interface<OverviewPageService> => ({
  get: jest.fn().mockResolvedValue({
    staffRoles: [{ role: 'KW', description: 'Keyworker' }],
  }),
})
