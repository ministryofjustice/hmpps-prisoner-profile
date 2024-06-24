import Interface from './Interface'
import PermissionsService from '../../server/services/permissionsService'

export const permissionsServiceMock = (): Interface<PermissionsService> => ({
  getOverviewPermissions: jest.fn().mockResolvedValue({ accessCode: 'OK' }),
  getMoneyPermissions: jest.fn().mockResolvedValue({ accessCode: 'OK' }),
  getCaseNotesPermissions: jest.fn().mockResolvedValue({ accessCode: 'OK' }),
})
