import { ManageSocCasesApiClient } from '../../server/data/interfaces/manageSocCasesApi/manageSocCasesApiClient'

export const manageSocCasesApiClientMock = (): ManageSocCasesApiClient => ({
  getNominal: jest.fn(),
})

export default { manageSocCasesApiClientMock }
