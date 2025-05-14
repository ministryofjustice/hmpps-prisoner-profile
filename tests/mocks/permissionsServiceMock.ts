import Interface from './Interface'
import PermissionsService from '../../server/services/permissionsService'

export const permissionsServiceMock = (): Interface<PermissionsService> => ({
  getMoneyPermissions: jest.fn().mockResolvedValue({ accessCode: 'OK' }),
  getProbationDocumentsPermissions: jest.fn().mockResolvedValue({ accessCode: 'OK' }),
  getAppointmentPermissions: jest.fn().mockResolvedValue({ accessCode: 'OK' }),
  getAlertsPermissions: jest.fn().mockResolvedValue({ accessCode: 'OK' }),
  getEditAlertsPermissions: jest.fn().mockResolvedValue({ accessCode: 'OK' }),
  getLocationPermissions: jest.fn().mockResolvedValue({ accessCode: 'OK' }),
})
