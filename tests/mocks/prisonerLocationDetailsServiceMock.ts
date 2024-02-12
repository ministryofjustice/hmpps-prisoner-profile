import PrisonerLocationDetailsService from '../../server/services/prisonerLocationDetailsService'

type Interface<T> = {
  [P in keyof T]: T[P]
}

export const prisonerLocationDetailsServiceMock = (): Interface<PrisonerLocationDetailsService> => ({
  getInmatesAtLocation: jest.fn(),
  isReceptionFull: jest.fn(),
  getLocationDetailsByLatestFirst: jest.fn(),
  getLocationDetailsGroupedByPeriodAtAgency: jest.fn(),
})
