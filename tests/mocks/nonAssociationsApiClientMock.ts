import { NonAssociationsApiClient } from '../../server/data/interfaces/nonAssociationsApi/nonAssociationsApiClient'

export const nonAssociationsApiClientMock = (): NonAssociationsApiClient => ({
  getPrisonerNonAssociations: jest.fn(),
})

export default { nonAssociationsApiClientMock }
