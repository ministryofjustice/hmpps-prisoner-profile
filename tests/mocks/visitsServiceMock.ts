import { VisitsService } from '../../server/services/visitsService'
import Interface from './Interface'

export const visitsServiceMock = (): Interface<VisitsService> => ({
  sortVisitors: jest.fn(),
  getVisits: jest.fn(),
  getVisitsOverview: jest.fn(),
})
