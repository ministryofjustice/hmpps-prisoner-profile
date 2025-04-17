import PermissionsService from './permissionsService'
import { userServiceMock } from '../../tests/mocks/userServiceMock'
import UserService from './userService'
import { prisonUserMock } from '../data/localMockData/user'
import { PrisonerMockDataA } from '../data/localMockData/prisoner'
import { HmppsStatusCode } from '../data/enums/hmppsStatusCode'
import getOverviewAccessStatusCode from './utils/permissions/access/getOverviewAccessStatusCode'
import getCourtCasesPermissions from './utils/permissions/getCourtCasesPermissions'
import getMoneyPermissions from './utils/permissions/getMoneyPermissions'
import getAdjudicationsPermissions from './utils/permissions/getAdjudicationsPermissions'
import getVisitsPermissions from './utils/permissions/getVisitsPermissions'
import getIncentivesPermissions from './utils/permissions/getIncentivesPermissions'
import getCategoryPermissions from './utils/permissions/getCategoryPermissions'
import getCalculateReleaseDatesPermissions from './utils/permissions/getCalculateReleaseDatesPermissions'
import getCaseNotesPermissions from './utils/permissions/getCaseNotesPermissions'
import getKeyWorkerPermissions from './utils/permissions/getKeyworkerPermissions'
import getAppointmentPermissions from './utils/permissions/getAppointmentPermissions'
import getUseOfForcePermissions from './utils/permissions/getUseOfForcePermissions'
import getActivityPermissions from './utils/permissions/getActivityPermissions'
import getPathfinderPermissions from './utils/permissions/getPathfinderPermissions'
import getSocPermissions from './utils/permissions/getSocPermissions'
import getOffenderCategorisationPermissions from './utils/permissions/getOffenderCategorisationPermissions'
import getProbationDocumentsPermissions from './utils/permissions/getProbationDocumentsPermissions'
import getMoneyAccessStatusCode from './utils/permissions/access/getMoneyAccessStatusCode'
import getCaseNotesAccessStatusCode from './utils/permissions/access/getCaseNotesAccessStatusCode'
import getSensitiveCaseNotesPermissions from './utils/permissions/getSensitiveCaseNotesPermissions'
import getActiveCaseLoadOnlyAccessStatusCode from './utils/permissions/access/getActiveCaseLoadOnlyAccessStatusCode'
import getAlertsPermissions from './utils/permissions/getAlertsPermissions'
import getCellMovePermissions from './utils/permissions/getCellMovePermissions'
import getProbationDocumentsAccessStatusCode from './utils/permissions/access/getProbationDocumentsAccessStatusCode'
import getCSIPPermissions from './utils/permissions/getCSIPPermissions'

jest.mock('./utils/permissions/access/getOverviewAccessStatusCode', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/access/getMoneyAccessStatusCode', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/access/getCaseNotesAccessStatusCode', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/getCourtCasesPermissions', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/getMoneyPermissions', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/getAdjudicationsPermissions', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/getVisitsPermissions', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/getIncentivesPermissions', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/getCategoryPermissions', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/getCalculateReleaseDatesPermissions', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/getCaseNotesPermissions', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/getKeyworkerPermissions', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/getAppointmentPermissions', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/getUseOfForcePermissions', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/getActivityPermissions', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/getPathfinderPermissions', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/getSocPermissions', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/getOffenderCategorisationPermissions', () => ({
  __esModule: true,
  default: jest.fn(),
}))

jest.mock('./utils/permissions/getProbationDocumentsPermissions', () => ({
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

jest.mock('./utils/permissions/getCSIPPermissions', () => ({
  __esModule: true,
  default: jest.fn(),
}))

describe('permissionsService', () => {
  let service: PermissionsService
  const userService = userServiceMock() as UserService

  beforeEach(() => {
    service = new PermissionsService(userService)
  })

  describe('getOverviewPermissions', () => {
    it.each([
      HmppsStatusCode.RESTRICTED_PATIENT,
      HmppsStatusCode.NOT_IN_CASELOAD,
      HmppsStatusCode.PRISONER_IS_TRANSFERRING,
      HmppsStatusCode.PRISONER_IS_RELEASED,
    ])('should return just the access code if it is %s', async statusCode => {
      ;(getOverviewAccessStatusCode as jest.Mock).mockReturnValue(statusCode)

      const permissions = await service.getOverviewPermissions(prisonUserMock, PrisonerMockDataA)

      expect(permissions).toEqual({
        accessCode: statusCode,
      })
    })

    it('should retrieve the specific permissions for the overview page if access code is HmppsStatusCode.OK', async () => {
      ;(getOverviewAccessStatusCode as jest.Mock).mockReturnValue(HmppsStatusCode.OK)
      ;(getCourtCasesPermissions as jest.Mock).mockReturnValue('court cases')
      ;(getMoneyPermissions as jest.Mock).mockReturnValue('money')
      ;(getAdjudicationsPermissions as jest.Mock).mockReturnValue('adjudications')
      ;(getVisitsPermissions as jest.Mock).mockReturnValue('vists')
      ;(getIncentivesPermissions as jest.Mock).mockReturnValue('incentives')
      ;(getCategoryPermissions as jest.Mock).mockReturnValue('category')
      ;(getCalculateReleaseDatesPermissions as jest.Mock).mockReturnValue('calculate release dates')
      ;(getCaseNotesPermissions as jest.Mock).mockReturnValue('case notes')
      ;(getKeyWorkerPermissions as jest.Mock).mockReturnValue('key worker')
      ;(getAppointmentPermissions as jest.Mock).mockReturnValue('appointment')
      ;(getUseOfForcePermissions as jest.Mock).mockReturnValue('use of force')
      ;(getActivityPermissions as jest.Mock).mockReturnValue('activity')
      ;(getPathfinderPermissions as jest.Mock).mockReturnValue('pathfinder')
      ;(getSocPermissions as jest.Mock).mockReturnValue('soc')
      ;(getOffenderCategorisationPermissions as jest.Mock).mockReturnValue('offender cat')
      ;(getProbationDocumentsPermissions as jest.Mock).mockReturnValue('probation docs')
      ;(getCSIPPermissions as jest.Mock).mockReturnValue('csip')

      const permissions = await service.getOverviewPermissions(prisonUserMock, PrisonerMockDataA)

      expect(permissions).toEqual({
        accessCode: HmppsStatusCode.OK,
        courtCases: 'court cases',
        money: 'money',
        adjudications: 'adjudications',
        visits: 'vists',
        incentives: 'incentives',
        category: 'category',
        calculateReleaseDates: 'calculate release dates',
        caseNotes: 'case notes',
        keyWorker: 'key worker',
        appointment: 'appointment',
        useOfForce: 'use of force',
        activity: 'activity',
        pathfinder: 'pathfinder',
        soc: 'soc',
        offenderCategorisation: 'offender cat',
        probationDocuments: 'probation docs',
        csip: 'csip',
      })
    })
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

  describe('getCaseNotesPermissions', () => {
    it.each([
      HmppsStatusCode.RESTRICTED_PATIENT,
      HmppsStatusCode.NOT_IN_CASELOAD,
      HmppsStatusCode.PRISONER_IS_TRANSFERRING,
      HmppsStatusCode.PRISONER_IS_RELEASED,
    ])('should return just the access code if it is %s', statusCode => {
      ;(getCaseNotesAccessStatusCode as jest.Mock).mockReturnValue(statusCode)

      const permissions = service.getCaseNotesPermissions(prisonUserMock, PrisonerMockDataA)

      expect(permissions).toEqual({
        accessCode: statusCode,
      })
    })

    it('should retrieve the sensitive case notes permissions if access code is HmppsStatusCode.OK', () => {
      ;(getCaseNotesAccessStatusCode as jest.Mock).mockReturnValue(HmppsStatusCode.OK)
      ;(getSensitiveCaseNotesPermissions as jest.Mock).mockReturnValue('sensitive case notes')

      const permissions = service.getCaseNotesPermissions(prisonUserMock, PrisonerMockDataA)

      expect(permissions).toEqual({
        accessCode: HmppsStatusCode.OK,
        sensitiveCaseNotes: 'sensitive case notes',
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
