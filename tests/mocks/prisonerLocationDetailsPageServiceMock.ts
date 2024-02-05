import PrisonerLocationDetailsPageService from '../../server/services/prisonerLocationDetailsPageService'

type Interface<T> = {
  [P in keyof T]: T[P]
}

// eslint-disable-next-line import/prefer-default-export
export const prisonerLocationDetailsPageServiceMock = (): Interface<PrisonerLocationDetailsPageService> => ({
  getLocationDetailsGroupedByPeriodAtAgency: jest.fn(),
})
