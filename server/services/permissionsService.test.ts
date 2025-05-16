import PermissionsService from './permissionsService'
import { prisonUserMock } from '../data/localMockData/user'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { HmppsStatusCode } from '../data/enums/hmppsStatusCode'
import getOverviewAccessStatusCode from './utils/permissions/access/getOverviewAccessStatusCode'
import getMoneyAccessStatusCode from './utils/permissions/access/getMoneyAccessStatusCode'
import getActiveCaseLoadOnlyAccessStatusCode from './utils/permissions/access/getActiveCaseLoadOnlyAccessStatusCode'
import getAlertsPermissions from './utils/permissions/getAlertsPermissions'
import getCellMovePermissions from './utils/permissions/getCellMovePermissions'
import getProbationDocumentsAccessStatusCode from './utils/permissions/access/getProbationDocumentsAccessStatusCode'

jest.mock('./utils/permissions/access/getOverviewAccessStatusCode', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/access/getMoneyAccessStatusCode', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/getSensitiveCaseNotesPermissions', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/access/getActiveCaseLoadOnlyAccessStatusCode', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/getAlertsPermissions', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/getCellMovePermissions', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/access/getProbationDocumentsAccessStatusCode', () => ({
  __esModule: true,
  default: jest.fn(),
}))

describe('permissionsService', () => {
  let service: PermissionsService

  beforeEach(() => {
    service = new PermissionsService()
  })

  describe('getMoneyPermissions', () => {
    it.each([
      HmppsStatusCode.RESTRICTED_PATIENT,
      HmppsStatusCode.NOT_IN_CASELOAD,
      HmppsStatusCode.PRISONER_IS_TRANSFERRING,
      HmppsStatusCode.PRISONER_IS_RELEASED,
      HmppsStatusCode.OK,
    ])('should return just the access code if it is %s', statusCode => {
      ;(getMoneyAccessStatusCode as jest.Mock).mockReturnValue(statusCode)

      const permissions = service.getMoneyPermissions(prisonUserMock, PrisonerMockDataA)

      expect(permissions).toEqual({
        accessCode: statusCode,
      })
    })
  })

  describe('getStandardAccessPermission', () => {
    it.each([
      HmppsStatusCode.RESTRICTED_PATIENT,
      HmppsStatusCode.NOT_IN_CASELOAD,
      HmppsStatusCode.PRISONER_IS_TRANSFERRING,
      HmppsStatusCode.PRISONER_IS_RELEASED,
      HmppsStatusCode.OK,
    ])('should return just the access code if it is %s', statusCode => {
      ;(getOverviewAccessStatusCode as jest.Mock).mockReturnValue(statusCode)

      const permissions = service.getStandardAccessPermission(prisonUserMock, PrisonerMockDataA)

      expect(permissions).toEqual({
        accessCode: statusCode,
      })
    })
  })

  describe('getAppointmentPermissions', () => {
    it.each([
      HmppsStatusCode.RESTRICTED_PATIENT,
      HmppsStatusCode.NOT_IN_CASELOAD,
      HmppsStatusCode.PRISONER_IS_TRANSFERRING,
      HmppsStatusCode.PRISONER_IS_RELEASED,
      HmppsStatusCode.OK,
    ])('should return just the access code if it is %s', statusCode => {
      ;(getActiveCaseLoadOnlyAccessStatusCode as jest.Mock).mockReturnValue(statusCode)

      const permissions = service.getAppointmentPermissions(prisonUserMock, PrisonerMockDataA)

      expect(permissions).toEqual({
        accessCode: statusCode,
      })
    })
  })

  describe('getAlertsPermissions', () => {
    it.each([
      HmppsStatusCode.RESTRICTED_PATIENT,
      HmppsStatusCode.NOT_IN_CASELOAD,
      HmppsStatusCode.PRISONER_IS_TRANSFERRING,
      HmppsStatusCode.PRISONER_IS_RELEASED,
    ])('should return just the access code if it is %s', statusCode => {
      ;(getOverviewAccessStatusCode as jest.Mock).mockReturnValue(statusCode)

      const permissions = service.getAlertsPermissions(prisonUserMock, PrisonerMockDataA)

      expect(permissions).toEqual({
        accessCode: statusCode,
      })
    })

    it('should return the access code and the alerts permissions if access code is HmppsStatusCode.OK', () => {
      ;(getOverviewAccessStatusCode as jest.Mock).mockReturnValue(HmppsStatusCode.OK)
      ;(getAlertsPermissions as jest.Mock).mockReturnValue('alerts')

      const permissions = service.getAlertsPermissions(prisonUserMock, PrisonerMockDataA)

      expect(permissions).toEqual({
        accessCode: HmppsStatusCode.OK,
        alerts: 'alerts',
      })
    })
  })

  describe('getEditAlertsPermissions', () => {
    it('should get alerts permissions and return HmppsStatusCode.NOT_FOUND if edit permission is false', () => {
      ;(getOverviewAccessStatusCode as jest.Mock).mockReturnValue(HmppsStatusCode.OK)
      ;(getAlertsPermissions as jest.Mock).mockReturnValue({ edit: false })

      const permissions = service.getEditAlertsPermissions(prisonUserMock, PrisonerMockDataA)

      expect(permissions).toEqual({
        accessCode: HmppsStatusCode.NOT_FOUND,
        alerts: { edit: false },
      })
    })

    it('should get alerts permissions and return HmppsStatusCode.OK if edit permission is true', () => {
      ;(getOverviewAccessStatusCode as jest.Mock).mockReturnValue(HmppsStatusCode.OK)
      ;(getAlertsPermissions as jest.Mock).mockReturnValue({ edit: true })

      const permissions = service.getEditAlertsPermissions(prisonUserMock, PrisonerMockDataA)

      expect(permissions).toEqual({
        accessCode: HmppsStatusCode.OK,
        alerts: { edit: true },
      })
    })
  })

  describe('getLocationPermissions', () => {
    it.each([
      HmppsStatusCode.RESTRICTED_PATIENT,
      HmppsStatusCode.NOT_IN_CASELOAD,
      HmppsStatusCode.PRISONER_IS_TRANSFERRING,
      HmppsStatusCode.PRISONER_IS_RELEASED,
      HmppsStatusCode.GLOBAL_USER_NOT_PERMITTED,
    ])('should return just the access code if it is %s', statusCode => {
      ;(getOverviewAccessStatusCode as jest.Mock).mockReturnValue(statusCode)

      const permissions = service.getLocationPermissions(prisonUserMock, PrisonerMockDataA)

      expect(permissions).toEqual({
        accessCode: statusCode,
      })
    })

    it('should return the access code and the alerts permissions if access code is HmppsStatusCode.OK', () => {
      ;(getOverviewAccessStatusCode as jest.Mock).mockReturnValue(HmppsStatusCode.OK)
      ;(getCellMovePermissions as jest.Mock).mockReturnValue('cell move')

      const permissions = service.getLocationPermissions(prisonUserMock, PrisonerMockDataA)

      expect(permissions).toEqual({
        accessCode: HmppsStatusCode.OK,
        cellMove: 'cell move',
      })
    })
  })

  describe('getProbationDocumentsPermissions', () => {
    it.each([
      HmppsStatusCode.RESTRICTED_PATIENT,
      HmppsStatusCode.NOT_IN_CASELOAD,
      HmppsStatusCode.PRISONER_IS_TRANSFERRING,
      HmppsStatusCode.PRISONER_IS_RELEASED,
      HmppsStatusCode.OK,
    ])('should return just the access code if it is %s', statusCode => {
      ;(getProbationDocumentsAccessStatusCode as jest.Mock).mockReturnValue(statusCode)

      const permissions = service.getProbationDocumentsPermissions(prisonUserMock, PrisonerMockDataA)

      expect(permissions).toEqual({
        accessCode: statusCode,
      })
    })
  })
})
