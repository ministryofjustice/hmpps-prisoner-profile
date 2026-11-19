import type { PermissionsApi } from '../../server/data/interfaces/permissionsApi'

export const permissionsApiClientMock = (): jest.Mocked<PermissionsApi> => ({
  checkHighProfilePrisonerStatus: jest.fn().mockResolvedValue(false),
})

export default { permissionsApiClientMock }
