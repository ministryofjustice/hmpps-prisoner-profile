import Interface from './Interface'
import PermissionsService from '../../server/services/permissionsService'

export const permissionsServiceMock = (): Interface<PermissionsService> => ({
  getOverviewPermissions: jest.fn().mockResolvedValue({ accessCode: 'OK' }),
  getMoneyPermissions: jest.fn().mockResolvedValue({ accessCode: 'OK' }),
  getCaseNotesPermissions: jest.fn().mockResolvedValue({ accessCode: 'OK' }),
  getProbationDocumentsPermissions: jest.fn().mockResolvedValue({ accessCode: 'OK' }),
  getStandardAccessPermission: jest.fn().mockResolvedValue({ accessCode: 'OK' }),
  getAppointmentPermissions: jest.fn().mockResolvedValue({ accessCode: 'OK' }),
  getAlertsPermissions: jest.fn().mockResolvedValue({ accessCode: 'OK' }),
  getEditAlertsPermissions: jest.fn().mockResolvedValue({ accessCode: 'OK' }),
  getLocationPermissions: jest.fn().mockResolvedValue({ accessCode: 'OK' }),
})
