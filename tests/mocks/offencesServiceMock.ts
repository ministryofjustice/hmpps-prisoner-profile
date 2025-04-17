import OffencesService from '../../server/services/offencesService'
import Interface from './Interface'

export const offencesServiceMock = (): Interface<OffencesService> => ({
  getNextCourtHearingSummary: jest.fn(),
  getActiveCourtCasesCount: jest.fn(),
  getLatestReleaseCalculation: jest.fn(),
  getOffencesOverview: jest.fn(),
})
